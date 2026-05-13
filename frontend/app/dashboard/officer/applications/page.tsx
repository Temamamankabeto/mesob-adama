"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import ApplicationStatusBadge from "@/components/application/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOfficerApplicationQueue } from "@/hooks/application-workflow/use-application-workflow";

export default function OfficerApplicationsPage() {
  const { data = [], isLoading } = useOfficerApplicationQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Officer Queue</h1>
        <p className="text-sm text-muted-foreground">Review and process assigned service applications.</p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length ? (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.tracking_number}</TableCell>
                      <TableCell>{item.service?.name || item.service_id}</TableCell>
                      <TableCell>{item.customer?.name || item.customer_id}</TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/officer/applications/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No applications in your queue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
