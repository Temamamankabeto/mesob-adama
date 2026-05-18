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

function storedRoles() {
  return authService
    .getStoredRoles()
    .map((role) => String(role).toLowerCase());
}

function isBackOfficer() {
  return storedRoles().some((role) => role.includes("back"));
}

function isFrontOfficer() {
  return storedRoles().some((role) => role.includes("front"));
}

function normalize(value?: string | null) {
  return String(value || "").toLowerCase();
}

function isFinalStatus(status?: string | null) {
  return ["completed", "rejected", "returned_to_customer", "cancelled"].includes(
    normalize(status)
  );
}

function isBackApproved(status?: string | null, stage?: string | null) {
  const current = normalize(status);
  const currentStage = normalize(stage);

  return [
    "approved",
    "back_officer_approved",
    "returned_to_front_officer",
  ].includes(current) || [
    "approved",
    "back_officer_approved",
    "returned_to_front_officer",
  ].includes(currentStage);
}

function isBackRejected(status?: string | null, stage?: string | null) {
  const current = normalize(status);
  const currentStage = normalize(stage);

  return [
    "back_officer_rejected",
    "returned_from_back_officer",
    "returned_to_front_officer_rejected",
  ].includes(current) || [
    "back_officer_rejected",
    "returned_from_back_officer",
    "returned_to_front_officer_rejected",
  ].includes(currentStage);
}

function officerRoleName(officer: any) {
  return String(
    officer?.role ||
      officer?.role_names?.[0] ||
      officer?.roles?.[0]?.name ||
      ""
  ).toLowerCase();
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
  const [actionSubmitted, setActionSubmitted] = useState(false);

  const shouldFetchSharing = pendingAction?.requiresShare === true;

  const { data: shareWindows = [] } =
    useOfficerSharingWindows(shouldFetchSharing);

  const { data: rawShareOfficers = [] } = useOfficerSharingOfficers(
    shareWindowId,
    shouldFetchSharing
  );

  const front = isFrontOfficer();
  const back = isBackOfficer();
  const files = useMemo(() => documents, [documents]);

  const status = data?.status;
  const stage = data?.current_stage;
  const serviceHasBackOfficer = Boolean(data?.service?.has_back_officer);
  const backApproved = isBackApproved(status, stage);
  const backRejected = isBackRejected(status, stage);
  const actionVisible = !isFinalStatus(status) && !actionSubmitted;

  const shareOfficers = useMemo(() => {
    if (!pendingAction?.requiresShare) return [];

    return rawShareOfficers.filter((officer: any) => {
      const role = officerRoleName(officer);

      if (pendingAction.actor === "back") {
        return role.includes("back");
      }

      return role.includes("front");
    });
  }, [rawShareOfficers, pendingAction]);

  const frontActions = useMemo<PendingAction[]>(() => {
    if (!front || !actionVisible) return [];

    /*
    |--------------------------------------------------------------------------
    | Front Officer action rules
    |--------------------------------------------------------------------------
    | 1. If Back Officer approved:
    |    - show Accept & Complete
    |    - keep Share with Another Officer
    |
    | 2. If Back Officer rejected/returned as rejected:
    |    - show Reject & Return to Customer
    |    - keep Share with Another Officer
    |
    | 3. If service has Back Officer and still waiting:
    |    - show Accept
    |    - show Accept & Forward to Back Officer
    |    - keep Share with Another Officer
    |
    | 4. If service has no Back Officer:
    |    - show Accept
    |    - show Complete
    |    - show Reject
    |    - show Return
    |    - keep Share with Another Officer
    */

    if (backApproved) {
      return [
        {
          actor: "front",
          action: "complete",
          label: "Accept & Complete",
        },
        {
          actor: "front",
          action: "share-to-officer",
          label: "Share with Another Officer",
          requiresShare: true,
        },
      ];
    }

    if (backRejected) {
      return [
        {
          actor: "front",
          action: "reject",
          label: "Reject & Return to Customer",
        },
        {
          actor: "front",
          action: "share-to-officer",
          label: "Share with Another Officer",
          requiresShare: true,
        },
      ];
    }

    if (serviceHasBackOfficer) {
      return [
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
          label: "Share with Another Officer",
          requiresShare: true,
        },
      ];
    }

    return [
      {
        actor: "front",
        action: "accept",
        label: "Accept",
      },
      {
        actor: "front",
        action: "complete",
        label: "Accept & Complete",
      },
      {
        actor: "front",
        action: "reject",
        label: "Reject & Return to Customer",
      },
      {
        actor: "front",
        action: "return",
        label: "Return to Customer",
      },
      {
        actor: "front",
        action: "share-to-officer",
        label: "Share with Another Officer",
        requiresShare: true,
      },
    ];
  }, [
    front,
    actionVisible,
    serviceHasBackOfficer,
    backApproved,
    backRejected,
  ]);

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
        action: "share",
        label: "Share with Another Back Officer",
        requiresShare: true,
      },
      {
        actor: "back",
        action: "escalate-to-manager",
        label: "Escalate to Manager",
      },
    ];
  }, [back, actionVisible]);

  const activeActions = back ? backActions : frontActions;

  function resetActionForm() {
    setPendingAction(null);
    setRemark("");
    setDocuments([]);
    setShareWindowId(undefined);
    setShareOfficerId(undefined);
  }

  async function submitFrontAction(action: PendingAction) {
    if (action.actor !== "front") return;

    if (action.requiresShare) {
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

      return;
    }

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

  async function submitBackAction(action: PendingAction) {
    if (action.actor !== "back") return;

    if (action.action === "share") {
      if (!shareWindowId || !shareOfficerId) {
        toast.error("Select window and back officer.");
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

      return;
    }

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

  async function submitSelectedAction() {
    if (!pendingAction) return;

    try {
      if (pendingAction.actor === "front") {
        await submitFrontAction(pendingAction);
      } else {
        await submitBackAction(pendingAction);
      }

      setActionSubmitted(true);
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

  function selectAction(value: string) {
    const action = activeActions.find((item) => item.action === value);

    setPendingAction(action || null);
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
          <CardTitle>Workflow Action</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {actionVisible && activeActions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">
                  {back ? "Back Officer Action" : "Front Officer Action"}
                </label>
                <select
                  className="mt-2 w-full rounded-md border bg-background p-3 text-sm"
                  value={pendingAction?.action || ""}
                  onChange={(event) => selectAction(event.target.value)}
                >
                  <option value="">Select action</option>
                  {activeActions.map((action) => (
                    <option key={action.action} value={action.action}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              {pendingAction?.requiresShare && (
                <>
                  <div>
                    <label className="text-sm font-medium">Window</label>
                    <select
                      className="mt-2 w-full rounded-md border bg-background p-3 text-sm"
                      value={shareWindowId || ""}
                      onChange={(event) => {
                        setShareWindowId(
                          event.target.value
                            ? Number(event.target.value)
                            : undefined
                        );
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
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      {back ? "Back Officer" : "Front Officer"}
                    </label>
                    <select
                      className="mt-2 w-full rounded-md border bg-background p-3 text-sm"
                      value={shareOfficerId || ""}
                      onChange={(event) =>
                        setShareOfficerId(
                          event.target.value
                            ? Number(event.target.value)
                            : undefined
                        )
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
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No actions available for the current status, or action already submitted successfully.
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
                  onChange={(event) =>
                    setDocuments(Array.from(event.target.files || []))
                  }
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
                    (pendingAction.requiresShare &&
                      (!shareWindowId || !shareOfficerId))
                  }
                >
                  Submit
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
              {data.submitted_at
                ? new Date(data.submitted_at).toLocaleString()
                : "-"}
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
            <ApplicationWorkflowTimeline
              workflow={data.workflow}
              histories={data.histories}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
