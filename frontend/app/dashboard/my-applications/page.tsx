"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Search } from "lucide-react";

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

export default function DashboardMyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCustomerApplications({
    page,
    search,
  });

  const applications = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your submitted service applications and current statuses.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Application List</CardTitle>
            <p className="text-sm text-muted-foreground">
              {meta?.total || 0} application(s)
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
              placeholder="Search by tracking number or service..."
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-2xl border">
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
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : applications.length ? (
                  applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
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
                          ? new Date(application.submitted_at).toLocaleString()
                          : "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
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
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex items-center justify-between">
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
