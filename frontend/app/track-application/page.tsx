"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import ApplicationFilesList from "@/components/application/ApplicationFilesList";
import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import ApplicationWorkflowTimeline from "@/components/application/ApplicationWorkflowTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrackApplication } from "@/hooks/application/use-application";

export default function TrackApplicationPage() {
  const params = useSearchParams();
  const initialTracking = params.get("tracking") || "";

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [application, setApplication] = useState<any>(null);

  const track = useTrackApplication();

  async function submit(event?: React.FormEvent) {
    event?.preventDefault();

    if (!trackingNumber.trim()) {
      toast.error("Enter tracking number");
      return;
    }

    try {
      const response = await track.mutateAsync({ tracking_number: trackingNumber.trim() });
      setApplication(response.data);
    } catch (error: any) {
      toast.error(error?.message || "Application not found");
      setApplication(null);
    }
  }

  useEffect(() => {
    if (initialTracking) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTracking]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Track Application</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your tracking number to check status.</p>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{application.tracking_number}</h1>
              <p className="text-sm text-muted-foreground">{application.service?.name}</p>
            </div>

            <ApplicationStatusBadge status={application.status} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationWorkflowTimeline workflow={application.workflow} histories={application.histories} />
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
