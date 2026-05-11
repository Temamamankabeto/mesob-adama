"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  AlertCircle,
  Clock3,
  FileText,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useApplicationDetails } from "@/hooks/application/use-application";

export default function MyApplicationDetailsPage() {

  const params = useParams();

  const id = Number(params.id);

  const {
    data,
    isLoading,
  } = useApplicationDetails(id);

  const application =
    data?.data;

  if (isLoading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!application) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="rounded-3xl p-10">
          <CardContent className="text-center">
            <AlertCircle className="mx-auto h-14 w-14 text-muted-foreground" />
            <h2 className="mt-5 text-2xl font-bold">
              Application Not Found
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline = [
    "Submitted",
    "Front Officer Review",
    "Back Officer Review",
    "Manager Approval",
    "Completed",
  ];

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="mx-auto max-w-7xl space-y-6 p-6">

        <div className="rounded-3xl border bg-background p-8 shadow-sm">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <Badge className="rounded-full px-4 py-1">
                Application Details
              </Badge>

              <h1 className="mt-4 text-4xl font-bold tracking-tight">
                {application.service_name}
              </h1>

              <p className="mt-3 text-muted-foreground">
                Tracking Number:
                <span className="ml-2 font-medium">
                  {application.tracking_number || "N/A"}
                </span>
              </p>
            </div>

            <div className="flex gap-3">

              <Badge
                variant="secondary"
                className="rounded-full px-5 py-2 text-sm"
              >
                {application.status}
              </Badge>

              {application.status === "returned" && (

                <Link
                  href={`/my-applications/${application.id}/edit`}
                >
                  <Button className="rounded-2xl">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit & Resubmit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-5 w-5" />
                Current Stage
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground">
                {application.current_stage || "Submitted"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Assigned Office
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground">
                {application.assigned_role || "Front Officer"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submitted Files
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground">
                {application.files_count || 0} Documents
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">

          <CardHeader>
            <CardTitle>
              Application Timeline
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="space-y-6">

              {timeline.map((item, index) => (

                <div
                  key={item}
                  className="flex items-start gap-4"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {item}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Enterprise workflow progress stage.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            <div className="space-y-4">

              <h3 className="text-lg font-semibold">
                Officer Comments
              </h3>

              <div className="rounded-2xl border bg-muted/20 p-5">

                <p className="text-sm text-muted-foreground">
                  {application.comment ||
                    "No officer comments available yet."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
