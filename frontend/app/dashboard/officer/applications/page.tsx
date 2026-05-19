"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Eye, Filter, Search } from "lucide-react";

import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOfficerApplicationQueue } from "@/hooks/application-workflow/use-application-workflow";

const queueFilters = [
  { value: "", label: "All Applications" },
  { value: "new", label: "New Applications" },
  { value: "shared", label: "Shared Applications" },
  { value: "accepted", label: "Accepted Applications" },
  { value: "approved", label: "Approved Applications" },
  { value: "escalated", label: "Escalated Applications" },
  { value: "returned", label: "Returned Applications" },
  { value: "rejected", label: "Rejected Applications" },
  { value: "completed", label: "Completed Applications" },
];

const statusFilters = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "accepted", label: "Accepted" },
  { value: "front_officer_review", label: "Front Officer Review" },
  { value: "shared", label: "Shared" },
  { value: "forwarded_to_back_officer", label: "Forwarded to Back Officer" },
  { value: "back_officer_review", label: "Back Officer Review" },
  { value: "back_officer_approved", label: "Back Officer Approved" },
  { value: "approved", label: "Approved" },
  { value: "returned", label: "Returned" },
  { value: "returned_to_customer", label: "Returned to Customer" },
  { value: "returned_to_front_officer", label: "Returned to Front Officer" },
  { value: "rejected", label: "Rejected" },
  { value: "escalated", label: "Escalated" },
  { value: "manager_review", label: "Manager Review" },
  { value: "completed", label: "Completed" },
];

const queueStatusMap: Record<string, string[]> = {
  new: ["submitted", "pending"],
  shared: ["shared"],
  accepted: ["accepted", "front_officer_review"],
  approved: ["approved", "back_officer_approved"],
  escalated: ["escalated", "manager_review"],
  returned: ["returned", "returned_to_customer", "returned_to_front_officer"],
  rejected: ["rejected"],
  completed: ["completed"],
};

function normalize(value?: string | null) {
  return String(value || "").toLowerCase();
}

function applicationMatchesQueue(application: any, bucket: string) {
  if (!bucket) return true;

  const status = normalize(application.status);
  const stage = normalize(application.current_stage);
  const allowed = queueStatusMap[bucket] || [];

  return allowed.includes(status) || allowed.includes(stage);
}

function applicationMatchesStatus(application: any, statusFilter: string) {
  if (!statusFilter) return true;

  const status = normalize(application.status);
  const stage = normalize(application.current_stage);

  return status === statusFilter || stage === statusFilter;
}

function applicationMatchesSearch(application: any, search: string) {
  const key = search.trim().toLowerCase();

  if (!key) return true;

  return (
    application.tracking_number?.toLowerCase().includes(key) ||
    application.service?.name?.toLowerCase().includes(key) ||
    application.customer?.name?.toLowerCase().includes(key) ||
    String(application.administrative_level || "").toLowerCase().includes(key) ||
    String(application.current_window?.name || "").toLowerCase().includes(key)
  );
}


function countForBucket(applications: any[], bucket: string) {
  if (!bucket) return applications.length;

  return applications.filter((application) =>
    applicationMatchesQueue(application, bucket)
  ).length;
}

function windowLabel(application: any) {
  return (
    application.current_window?.display_name ||
    application.current_window?.name ||
    application.current_window_id ||
    "-"
  );
}


export default function OfficerApplicationsPage() {
  const [bucket, setBucket] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Important
  |--------------------------------------------------------------------------
  | Backend may return a wider queue depending on workflow state.
  | We still pass filters to the API, but also filter client-side to guarantee
  | the visible result matches the selected filters.
  */
  const { data = [], isLoading } = useOfficerApplicationQueue({
    bucket: bucket || undefined,
    status: status || undefined,
    search: search || undefined,
  });

  const applications = useMemo(() => {
    return data.filter((application: any) => {
      return (
        applicationMatchesQueue(application, bucket) &&
        applicationMatchesStatus(application, status) &&
        applicationMatchesSearch(application, search)
      );
    });
  }, [data, bucket, status, search]);

  const queueCounts = useMemo(() => {
    return Object.fromEntries(
      queueFilters.map((filter) => [
        filter.value || "all",
        countForBucket(data, filter.value),
      ])
    );
  }, [data]);

  const urgentCount = useMemo(() => {
    return data.filter((application: any) =>
      ["submitted", "shared", "returned_to_front_officer", "back_officer_approved", "back_officer_rejected"].includes(
        normalize(application.status)
      ) ||
      ["submitted", "shared", "returned_to_front_officer", "back_officer_approved", "back_officer_rejected"].includes(
        normalize(application.current_stage)
      )
    ).length;
  }, [data]);

  function clearFilters() {
    setBucket("");
    setStatus("");
    setSearch("");
  }

  function handleBucketChange(value: string) {
    setBucket(value);

    /*
    |--------------------------------------------------------------------------
    | Avoid confusing AND filters
    |--------------------------------------------------------------------------
    | If the user chooses a queue, we reset the direct status filter.
    | They can still choose status after queue if they need extra narrowing.
    */
    setStatus("");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-3 sm:p-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Officer Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filter and process applications assigned to your service, window, level, and administrative scope.
        </p>
      </div>

      {urgentCount > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Bell className="h-4 w-4 text-primary" />
            You have {urgentCount} application(s) waiting for your action.
          </div>
        </div>
      )}

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium">Queue</label>
            <select
              className="mt-2 w-full rounded-md border bg-background p-3 text-sm"
              value={bucket}
              onChange={(event) => handleBucketChange(event.target.value)}
            >
              {queueFilters.map((filter) => (
                <option key={filter.value || "all"} value={filter.value}>
                  {filter.label} ({queueCounts[filter.value || "all"] || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="mt-2 w-full rounded-md border bg-background p-3 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {statusFilters.map((filter) => (
                <option key={filter.value || "all"} value={filter.value}>
                  {filter.label} ({queueCounts[filter.value || "all"] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracking number, service, customer, level, or window..."
                className="pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{applications.length} Application(s)</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading applications...</div>
          ) : applications.length ? (
            <div className="space-y-3">
              {applications.map((application: any) => (
                <div key={application.id} className="rounded-2xl border bg-background p-4 transition hover:bg-muted/30">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{application.tracking_number}</h3>
                        <ApplicationStatusBadge status={application.status} />
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.service?.name || "Service"} · {application.customer?.name || "Customer"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Level: {application.administrative_level || "-"}</span>
                        <span>Window: {windowLabel(application)}</span>
                        <span>Stage: {application.current_stage || "-"}</span>
                        <span>
                          Submitted:{" "}
                          {application.submitted_at
                            ? new Date(application.submitted_at).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </div>

                    <Button asChild size="sm" className="rounded-xl">
                      <Link href={`/dashboard/officer/applications/${application.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed py-12 text-center text-muted-foreground">
              No applications found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
