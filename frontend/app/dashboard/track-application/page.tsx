"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import ApplicationFilesList from "@/components/application/ApplicationFilesList";
import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import ApplicationWorkflowTimeline from "@/components/application/ApplicationWorkflowTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrackApplication } from "@/hooks/application/use-application";

export default function DashboardTrackApplicationPage() {
  const params = useSearchParams();
  const initialTracking = params.get("tracking") || "";

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [application, setApplication] = useState<any>(null);

  const track = useTrackApplication();

  async function submit(event?: FormEvent) {
    event?.preventDefault();

    const tracking = trackingNumber.trim();

    if (!tracking) {
      toast.error("Enter tracking number");
      return;
    }

    try {
      const response = await track.mutateAsync(tracking);

      setApplication(
        (response as any)?.data?.data ??
          (response as any)?.data ??
          response
      );
    } catch (error: any) {
      toast.error(error?.message || "Application not found");
      setApplication(null);
    }
  }

  useEffect(() => {
    if (initialTracking) {
      void submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTracking]);

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Track Application</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your tracking number to check application status and workflow progress.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="Example: ADA-2026-000001"
            />

            <Button disabled={track.isPending}>
              <Search className="mr-2 h-4 w-4" />
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {application && (
        <>
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {application.tracking_number}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.service?.name}
                </p>
              </div>

              <ApplicationStatusBadge status={application.status} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="rounded-3xl xl:col-span-2">
              <CardHeader>
                <CardTitle>Application Information</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                <Info
                  label="Service"
                  value={application.service?.name || application.service_id}
                />
                <Info
                  label="Tracking Number"
                  value={application.tracking_number}
                />
                <Info
                  label="Administrative Level"
                  value={application.administrative_level || "-"}
                />
                <Info
                  label="Location"
                  value={
                    application.woreda?.name ||
                    application.subcity?.name ||
                    application.city?.name ||
                    "-"
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <ApplicationStatusBadge status={application.status} />

                {application.rejection_reason && (
                  <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                    {application.rejection_reason}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Workflow Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationWorkflowTimeline
                  workflow={application.workflow || application.workflows}
                  histories={application.histories}
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Files</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationFilesList files={application.files} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize">{value}</p>
    </div>
  );
}