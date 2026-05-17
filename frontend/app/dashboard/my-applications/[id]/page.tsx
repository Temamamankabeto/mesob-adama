"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ApplicationFilesList from "@/components/application/ApplicationFilesList";
import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import ApplicationWorkflowTimeline from "@/components/application/ApplicationWorkflowTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerApplication } from "@/hooks/customer/use-customer-applications";

export default function DashboardMyApplicationDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useCustomerApplication(id);

  if (isLoading) return <div>Loading application...</div>;
  if (!data) return <div>Application not found.</div>;

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/dashboard/my-applications">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Link>
      </Button>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{data.tracking_number}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.service?.name || data.service_id}
            </p>
          </div>

          <ApplicationStatusBadge status={data.status} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl xl:col-span-2">
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <Info label="Service" value={data.service?.name || data.service_id} />
            <Info label="Tracking Number" value={data.tracking_number} />
            <Info label="Administrative Level" value={data.administrative_level || "-"} />
            <Info
              label="Location"
              value={data.woreda?.name || data.subcity?.name || data.city?.name || "-"}
            />
            <Info
              label="Submitted"
              value={data.submitted_at ? new Date(data.submitted_at).toLocaleString() : "-"}
            />
            <Info
              label="Completed"
              value={data.completed_at ? new Date(data.completed_at).toLocaleString() : "-"}
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <ApplicationStatusBadge status={data.status} />
            {data.rejection_reason && (
              <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                {data.rejection_reason}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Submitted Data</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.data?.length ? (
              data.data.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <p className="text-sm font-medium">{item.field_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.field_value || "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No submitted data found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>

          <CardContent>
            <ApplicationFilesList files={data.files} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Workflow Timeline</CardTitle>
        </CardHeader>

        <CardContent>
          <ApplicationWorkflowTimeline workflow={data.workflow || data.workflows} histories={data.histories} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize">{value}</p>
    </div>
  );
}
