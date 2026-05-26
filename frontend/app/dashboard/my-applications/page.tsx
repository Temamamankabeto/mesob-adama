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

const STATUS_FILTERS = [
  { key: "all", label: "Total" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "appointed", label: "Appointed" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
] as const;

type StatusKey = (typeof STATUS_FILTERS)[number]["key"];

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : applications.length ? (
                  applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-semibold">
                        {application.tracking_number}
                      </TableCell>
                      <TableCell>{application.service?.name || application.service_id}</TableCell>
                      <TableCell className="capitalize">
                        {application.administrative_level || "-"}
                      </TableCell>
                      <TableCell>
                        {application.woreda?.name ||
                          application.subcity?.name ||
                          application.city?.name ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={application.status} />
                      </TableCell>
                      <TableCell>
                        {application.submitted_at
                          ? new Date(application.submitted_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                          <Link href={`/dashboard/my-applications/${application.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
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
