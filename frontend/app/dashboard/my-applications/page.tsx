"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, FileText, Plus, Search } from "lucide-react";

import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerApplications } from "@/hooks/customer/use-customer-applications";

import { Badge } from "@/components/ui/badge";
const STATUS_FILTERS = [
  { key: "all", label: "Total Application" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "approved", label: "Approved" },
  { key: "appointed", label: "Appointed" },
  { key: "completed", label: "Completed" },
] as const;

type StatusKey = (typeof STATUS_FILTERS)[number]["key"];


function applicationActions(application: any) {
  const status = String(application.status || "").toLowerCase();

  const items = [
    {
      label: "View",
      href: `/dashboard/my-applications/${application.id}`,
    },
    {
      label: "Track",
      href: `/dashboard/track-application?tracking=${application.tracking_number}`,
    },
  ];

  if (status.includes("completed") || status.includes("approved")) {
    items.push({
      label: "Download",
      href: `/dashboard/my-applications/${application.id}`,
    });
  }

  if (status.includes("payment")) {
    items.push({
      label: "Pay",
      href: `/dashboard/payments?application_id=${application.id}`,
    });
  }

  if (status.includes("returned") || status.includes("rejected")) {
    items.push({
      label: "Resubmit",
      href: `/dashboard/my-applications/${application.id}/edit`,
    });
  }

  return items;
}

export default function DashboardMyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusKey>("all");

  const { data, isLoading } = useCustomerApplications({
    page,
    search,
    status: status === "all" ? undefined : status,
  });

  const applications = data?.data || [];
  const meta = data?.meta;
  const statusCounts = data?.meta?.status_counts;

  const activeLabel = useMemo(
    () => STATUS_FILTERS.find((item) => item.key === status)?.label || "Total",
    [status]
  );

  function getCount(key: StatusKey) {
    if (key === "all") return statusCounts?.total ?? meta?.total ?? 0;
    return statusCounts?.[key] ?? 0;
  }

  function changeStatus(nextStatus: StatusKey) {
    setStatus(nextStatus);
    setPage(1);
  }

  function getQueueBadge(status: string, isNext?: boolean) {
  const s = (status || "").toLowerCase();

  if (isNext) {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">
        Next in line
      </Badge>
    );
  }

  switch (s) {
    case "waiting":
      return (
        <Badge variant="secondary">
          Waiting
        </Badge>
      );

    case "serving":
      return (
        <Badge className="bg-blue-600 text-white hover:bg-blue-600">
          Being Served
        </Badge>
      );

    case "completed":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-600">
          Completed
        </Badge>
      );

    case "rejected":
      return (
        <Badge variant="destructive">
          Rejected
        </Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter your applications by status and track office decisions.
            </p>
          </div>

          <Button asChild className="rounded-2xl">
            <Link href="/services">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {STATUS_FILTERS.map((item) => {
          const active = status === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => changeStatus(item.key)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                active
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "bg-card text-card-foreground"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </span>
                <FileText className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{getCount(item.key)}</p>
            </button>
          );
        })}
      </div>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{activeLabel} Applications</CardTitle>
            <p className="text-sm text-muted-foreground">
              {meta?.total || 0} record(s) found
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search tracking number or service..."
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Queue No</TableHead>
                <TableHead>Queue Position</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : applications.length ? (
                 applications.map((application) => (
  <TableRow key={application.id}>
    <TableCell className="font-semibold">
      {application.tracking_number || `APP-${application.id}`}
    </TableCell>

   <TableCell>
  {application.queue?.queue_number ?? "-"}
</TableCell>

    <TableCell>
  {application.queue_info ? (
    <div className="flex flex-col gap-1">

      {/* QUEUE POSITION */}
      <span className="font-medium">
        ={application.queue_info.applications_ahead + 1}
      </span>

      {/* STATUS BADGE (SHADCN) */}
      {getQueueBadge(
        application.queue_info.status,
        application.queue_info.is_next
      )}

      {/* EXTRA INFO */}
      <span className="text-[11px] text-muted-foreground">
        Ahead: {application.queue_info.applications_ahead}
      </span>

    </div>
  ) : (
    "-"
  )}
</TableCell>

    <TableCell>
      {application.submitted_at
        ? new Date(application.submitted_at).toLocaleDateString()
        : "-"}
    </TableCell>

    <TableCell>
      <ApplicationStatusBadge status={application.status} />
    </TableCell>

    <TableCell className="text-right">
      <div className="flex flex-wrap justify-end gap-1 text-sm">
        {applicationActions(application).map((item, index) => (
          <span
            key={`${application.id}-${item.label}`}
            className="inline-flex items-center"
          >
            {index > 0 && (
              <span className="mx-1 text-muted-foreground">|</span>
            )}

            <Link
              href={item.href}
              className="font-medium text-primary hover:underline"
            >
              {item.label}
            </Link>
          </span>
        ))}
      </div>
    </TableCell>
  </TableRow>
))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                      No applications found for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Page {meta?.current_page || 1} of {meta?.last_page || 1}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!meta || meta.current_page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!meta || meta.current_page >= meta.last_page}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
