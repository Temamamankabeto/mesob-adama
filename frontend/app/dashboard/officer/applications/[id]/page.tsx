"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ApplicationFilesList from "@/components/application/ApplicationFilesList";
import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import ApplicationWorkflowTimeline from "@/components/application/ApplicationWorkflowTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth/auth.service";
import { applicationWorkflowService } from "@/services/application-workflow/application-workflow";
import {
  useBackOfficerApplicationAction,
  useOfficerApplication,
  useOfficerApplicationAction,
  useWindowFrontOfficers,
} from "@/hooks/application-workflow/use-application-workflow";

export default function OfficerApplicationDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [remark, setRemark] = useState("");
  const [shareWindowId, setShareWindowId] = useState<number | undefined>();
  const [shareOfficerId, setShareOfficerId] = useState<number | undefined>();
  const [documents, setDocuments] = useState<File[]>([]);

  const { data, isLoading } = useOfficerApplication(id);
  const frontAction = useOfficerApplicationAction(id);
  const backAction = useBackOfficerApplicationAction(id);
  const roles = authService.getStoredRoles();
  const isBackOfficer = roles.includes("back_officer");
  const isFrontOfficer = roles.includes("front_officer") || roles.includes("manager") || roles.includes("admin") || roles.includes("super_admin");

  const windows = data?.service?.windows || [];
  const selectedWindowId = shareWindowId || data?.current_window_id || windows?.[0]?.id;
  const { data: frontOfficers = [] } = useWindowFrontOfficers(selectedWindowId, data?.service_id);

  const status = data?.status;

  const canFrontAccept = ["submitted", "shared_to_front_officer", "returned_to_customer"].includes(String(status));
  const canFrontShare = ["submitted", "front_officer_review", "shared_to_front_officer"].includes(String(status));
  const canFrontReturn = ["front_officer_review", "shared_to_front_officer"].includes(String(status));
  const canForwardToBack = Boolean(data?.service?.has_back_officer) && ["front_officer_review", "shared_to_front_officer"].includes(String(status));
  const canFrontComplete =
    (!data?.service?.has_back_officer && ["front_officer_review", "shared_to_front_officer", "returned_to_customer"].includes(String(status))) ||
    String(status) === "back_officer_approved";

  const canBackApproveReject = ["forwarded_to_back_officer", "back_officer_review"].includes(String(status));

  const documentFiles = useMemo(() => documents, [documents]);

  async function runFrontAction(action: "accept" | "return" | "forward-to-back-officer" | "complete") {
    try {
      await frontAction.mutateAsync({
        action,
        payload: {
          remark,
          documents: documentFiles,
        },
      });
      setRemark("");
      setDocuments([]);
      toast.success("Action completed successfully");
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    }
  }

  async function runShare() {
    if (!shareOfficerId) {
      toast.error("Select front officer to share");
      return;
    }

    try {
      await frontAction.mutateAsync({
        action: "share",
        payload: {
          remark,
          officer_id: shareOfficerId,
          window_id: selectedWindowId,
        },
      });
      setRemark("");
      setShareOfficerId(undefined);
      toast.success("Application shared successfully");
    } catch (error: any) {
      toast.error(error?.message || "Share failed");
    }
  }

  async function runBackAction(action: "approve" | "reject") {
    try {
      await backAction.mutateAsync({
        action,
        payload: {
          remark,
          reason: remark,
          documents: action === "approve" ? documentFiles : [],
        },
      });
      setRemark("");
      setDocuments([]);
      toast.success(`Application ${action}d successfully`);
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    }
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{data.tracking_number}</h1>
          <p className="text-sm text-muted-foreground">{data.service?.name}</p>
        </div>

        <ApplicationStatusBadge status={data.status} />
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            placeholder="Remark / reason"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Attach Documents</label>
            <input
              type="file"
              multiple
              className="block w-full rounded-md border p-2 text-sm"
              onChange={(event) => setDocuments(Array.from(event.target.files || []))}
            />
            <p className="text-xs text-muted-foreground">
              Used for return, completion, and back officer approval documents.
            </p>
          </div>

          {isFrontOfficer && (
            <div className="space-y-3 rounded-2xl border p-4">
              <h3 className="font-semibold">Front Officer Actions</h3>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runFrontAction("accept")} disabled={!canFrontAccept || frontAction.isPending}>
                  Accept
                </Button>

                <Button variant="outline" onClick={() => runFrontAction("return")} disabled={!canFrontReturn || frontAction.isPending}>
                  Send Back
                </Button>

                <Button variant="outline" onClick={() => runFrontAction("forward-to-back-officer")} disabled={!canForwardToBack || frontAction.isPending}>
                  Forward to Back Officer
                </Button>

                <Button variant="outline" onClick={() => runFrontAction("complete")} disabled={!canFrontComplete || frontAction.isPending}>
                  Complete
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <select
                  className="rounded-md border p-2"
                  value={shareWindowId || ""}
                  onChange={(event) => setShareWindowId(event.target.value ? Number(event.target.value) : undefined)}
                >
                  <option value="">Current Window</option>
                  {windows?.map((window: any) => (
                    <option key={window.id} value={window.id}>
                      {window.name}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-md border p-2 md:col-span-2"
                  value={shareOfficerId || ""}
                  onChange={(event) => setShareOfficerId(event.target.value ? Number(event.target.value) : undefined)}
                >
                  <option value="">Select Front Officer</option>
                  {frontOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} {officer.phone ? `(${officer.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="secondary" onClick={runShare} disabled={!canFrontShare || frontAction.isPending}>
                Share to Front Officer
              </Button>
            </div>
          )}

          {isBackOfficer && (
            <div className="space-y-3 rounded-2xl border p-4">
              <h3 className="font-semibold">Back Officer Actions</h3>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runBackAction("approve")} disabled={!canBackApproveReject || backAction.isPending}>
                  Approve
                </Button>

                <Button variant="destructive" onClick={() => runBackAction("reject")} disabled={!canBackApproveReject || backAction.isPending}>
                  Reject
                </Button>
              </div>
            </div>
          )}

          <Button asChild variant="outline">
            <a href={applicationWorkflowService.officer.certificateUrl(id)} target="_blank" rel="noreferrer">
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
                  <div className="text-muted-foreground md:col-span-2">{item.field_value || "-"}</div>
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
              <span className="text-muted-foreground">Name:</span> {data.customer?.name || data.customer_id}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {data.customer?.email || "-"}
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
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationWorkflowTimeline workflow={data.workflow} histories={data.histories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
