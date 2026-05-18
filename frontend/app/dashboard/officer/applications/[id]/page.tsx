"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

import ApplicationFilesList from "@/components/application/ApplicationFilesList";
import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import ApplicationWorkflowTimeline from "@/components/application/ApplicationWorkflowTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useBackOfficerApplicationAction,
  useOfficerApplication,
  useOfficerApplicationAction,
  useOfficerSharingOfficers,
  useOfficerSharingWindows,
} from "@/hooks/application-workflow/use-application-workflow";
import { applicationWorkflowService } from "@/services/application-workflow/application-workflow";
import { authService } from "@/services/auth/auth.service";

type FrontAction =
  | "accept"
  | "complete"
  | "return"
  | "reject"
  | "forward-to-back-officer"
  | "share-to-officer";

type BackAction =
  | "approve"
  | "reject"
  | "return"
  | "share"
  | "escalate-to-manager";

type PendingAction =
  | {
      actor: "front";
      action: FrontAction;
      label: string;
      requiresShare?: boolean;
    }
  | {
      actor: "back";
      action: BackAction;
      label: string;
      requiresShare?: boolean;
    };

function hasRoleKeyword(keyword: string) {
  return authService
    .getStoredRoles()
    .some((role) => String(role).toLowerCase().includes(keyword));
}

function isBackOfficer() {
  return hasRoleKeyword("back");
}

function isFrontOfficer() {
  return hasRoleKeyword("front");
}

function canShowActions(status?: string | null) {
  return !["completed", "rejected", "returned_to_customer"].includes(String(status || ""));
}

export default function OfficerApplicationDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useOfficerApplication(id);
  const frontAction = useOfficerApplicationAction(id);
  const backAction = useBackOfficerApplicationAction(id);

  const [remark, setRemark] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [shareWindowId, setShareWindowId] = useState<number | undefined>();
  const [shareOfficerId, setShareOfficerId] = useState<number | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const shouldFetchSharing = pendingAction?.requiresShare === true;

  const { data: shareWindows = [] } = useOfficerSharingWindows();
  const { data: shareOfficers = [] } = useOfficerSharingOfficers(
    shouldFetchSharing ? shareWindowId : undefined
  );

  const front = isFrontOfficer();
  const back = isBackOfficer();
  const files = useMemo(() => documents, [documents]);

  const serviceHasBackOfficer = Boolean(data?.service?.has_back_officer);
  const actionVisible = canShowActions(data?.status);

  const frontActions = useMemo<PendingAction[]>(() => {
    if (!front || !actionVisible) return [];

    const actions: PendingAction[] = serviceHasBackOfficer
      ? [
          {
            actor: "front",
            action: "accept",
            label: "Accept",
          },
          {
            actor: "front",
            action: "forward-to-back-officer",
            label: "Accept & Forward to Back Officer",
          },
          {
            actor: "front",
            action: "share-to-officer",
            label: "Share with Officer",
            requiresShare: true,
          },
        ]
      : [
          {
            actor: "front",
            action: "accept",
            label: "Accept",
          },
          {
            actor: "front",
            action: "complete",
            label: "Complete",
          },
          {
            actor: "front",
            action: "reject",
            label: "Reject",
          },
          {
            actor: "front",
            action: "return",
            label: "Return to Customer",
          },
          {
            actor: "front",
            action: "share-to-officer",
            label: "Share with Officer",
            requiresShare: true,
          },
        ];

    return actions.filter((item) => !completedActions.includes(`${item.actor}:${item.action}`));
  }, [front, actionVisible, serviceHasBackOfficer, completedActions]);

  const backActions = useMemo<PendingAction[]>(() => {
    if (!back || !actionVisible) return [];

    return [
      {
        actor: "back",
        action: "approve",
        label: "Approve & Return to Front Officer",
      },
      {
        actor: "back",
        action: "reject",
        label: "Reject & Return to Front Officer",
      },
      {
        actor: "back",
        action: "return",
        label: "Return to Front Officer",
      },
      {
        actor: "back",
        action: "share",
        label: "Share with Back Officer",
        requiresShare: true,
      },
      {
        actor: "back",
        action: "escalate-to-manager",
        label: "Escalate to Manager",
      },
    ].filter((item) => !completedActions.includes(`${item.actor}:${item.action}`));
  }, [back, actionVisible, completedActions]);

  function resetActionForm() {
    setPendingAction(null);
    setRemark("");
    setDocuments([]);
    setShareWindowId(undefined);
    setShareOfficerId(undefined);
  }

  async function submitFrontAction(action: PendingAction) {
    try {
      if (action.action === "share-to-officer") {
        if (!shareWindowId || !shareOfficerId) {
          toast.error("Select window and officer.");
          return;
        }

        await frontAction.mutateAsync({
          action: "share-to-officer",
          payload: {
            to_window_id: shareWindowId,
            to_officer_id: shareOfficerId,
            note: remark,
            remark,
          },
        });
      } else {
        await frontAction.mutateAsync({
          action: action.action,
          payload: {
            remark,
            note: remark,
            reason: remark,
            documents: files,
          },
        });
      }

      setCompletedActions((current) => [...current, `${action.actor}:${action.action}`]);
      resetActionForm();
      toast.success("Action completed successfully.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          Object.values(error?.response?.data?.errors || {})?.flat()?.[0] ||
          error?.message ||
          "Action failed"
      );
    }
  }

  async function submitBackAction(action: PendingAction) {
    try {
      if (action.action === "share") {
        if (!shareWindowId || !shareOfficerId) {
          toast.error("Select window and officer.");
          return;
        }

        await backAction.mutateAsync({
          action: "share",
          payload: {
            to_window_id: shareWindowId,
            to_officer_id: shareOfficerId,
            window_id: shareWindowId,
            officer_id: shareOfficerId,
            note: remark,
            remark,
          },
        });
      } else {
        await backAction.mutateAsync({
          action: action.action,
          payload: {
            remark,
            note: remark,
            reason: remark,
            documents: files,
          },
        });
      }

      setCompletedActions((current) => [...current, `${action.actor}:${action.action}`]);
      resetActionForm();
      toast.success("Action completed successfully.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          Object.values(error?.response?.data?.errors || {})?.flat()?.[0] ||
          error?.message ||
          "Action failed"
      );
    }
  }

  async function submitSelectedAction() {
    if (!pendingAction) return;

    if (pendingAction.actor === "front") {
      await submitFrontAction(pendingAction);
      return;
    }

    await submitBackAction(pendingAction);
  }

  function selectAction(action: PendingAction) {
    setPendingAction(action);
    setRemark("");
    setDocuments([]);
    setShareWindowId(undefined);
    setShareOfficerId(undefined);
  }

  if (isLoading) return <div>Loading application...</div>;
  if (!data) return <div>Application not found.</div>;

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/dashboard/officer/applications">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Queue
        </Link>
      </Button>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{data.tracking_number}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.service?.name} · {data.customer?.name || data.customer_id}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Level: {data.administrative_level || "-"} · Window:{" "}
              {data.current_window?.name || data.current_window_id || "-"}
            </p>
          </div>

          <ApplicationStatusBadge status={data.status} />
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {front && actionVisible && (
            <div className="space-y-3 rounded-2xl border p-4">
              <div>
                <h3 className="font-semibold">Front Officer Actions</h3>
                <p className="text-sm text-muted-foreground">
                  {serviceHasBackOfficer
                    ? "This service requires Back Officer verification."
                    : "This service does not require Back Officer verification."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {frontActions.map((action) => (
                  <Button
                    key={`${action.actor}:${action.action}`}
                    type="button"
                    variant={
                      pendingAction?.actor === action.actor &&
                      pendingAction?.action === action.action
                        ? "default"
                        : "outline"
                    }
                    onClick={() => selectAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {back && actionVisible && (
            <div className="space-y-3 rounded-2xl border p-4">
              <div>
                <h3 className="font-semibold">Back Officer Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Review, approve, reject, share, or escalate the application.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {backActions.map((action) => (
                  <Button
                    key={`${action.actor}:${action.action}`}
                    type="button"
                    variant={
                      pendingAction?.actor === action.actor &&
                      pendingAction?.action === action.action
                        ? "default"
                        : "outline"
                    }
                    onClick={() => selectAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {pendingAction && (
            <div className="space-y-5 rounded-2xl border bg-muted/20 p-4">
              <div>
                <h3 className="font-semibold">{pendingAction.label}</h3>
                <p className="text-sm text-muted-foreground">
                  Add note/description and attach files before submitting.
                </p>
              </div>

              {pendingAction.requiresShare && (
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    className="rounded-md border bg-background p-2"
                    value={shareWindowId || ""}
                    onChange={(event) => {
                      setShareWindowId(event.target.value ? Number(event.target.value) : undefined);
                      setShareOfficerId(undefined);
                    }}
                  >
                    <option value="">Select window</option>
                    {shareWindows.map((window) => (
                      <option key={window.id} value={window.id}>
                        {window.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-md border bg-background p-2"
                    value={shareOfficerId || ""}
                    onChange={(event) =>
                      setShareOfficerId(event.target.value ? Number(event.target.value) : undefined)
                    }
                    disabled={!shareWindowId}
                  >
                    <option value="">Select officer</option>
                    {shareOfficers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="Description, comment, note, or reason"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Attach Documents</label>
                <input
                  type="file"
                  multiple
                  className="block w-full rounded-md border bg-background p-2 text-sm"
                  onChange={(event) => setDocuments(Array.from(event.target.files || []))}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetActionForm}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitSelectedAction}
                  disabled={
                    frontAction.isPending ||
                    backAction.isPending ||
                    (pendingAction.requiresShare && (!shareWindowId || !shareOfficerId))
                  }
                >
                  Submit {pendingAction.label}
                </Button>
              </div>
            </div>
          )}

          <Button asChild variant="outline">
            <a
              href={applicationWorkflowService.officer.certificateUrl(id)}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Certificate
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl xl:col-span-2">
          <CardHeader>
            <CardTitle>Submitted Data</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.data?.length ? (
              data.data.map((item) => (
                <div key={item.id} className="grid gap-2 rounded-2xl border p-4 md:grid-cols-3">
                  <div className="font-medium">{item.field_name}</div>
                  <div className="text-muted-foreground md:col-span-2">
                    {item.field_value || "-"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data submitted.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Applicant</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {data.customer?.name || data.customer_id}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {data.customer?.email || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {data.customer?.phone || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Submitted:</span>{" "}
              {data.submitted_at ? new Date(data.submitted_at).toLocaleString() : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationFilesList files={data.files} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Workflow History</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationWorkflowTimeline workflow={data.workflow} histories={data.histories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
