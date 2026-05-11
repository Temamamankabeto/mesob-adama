"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  CreditCard,
  FileText,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { usePublicService } from "@/hooks/public-service/use-public-service";

export default function ServiceDetailPage() {

  const params = useParams();

  const id = Number(params.id);

  const { data, isLoading } =
    usePublicService(id);

  const service = data?.data;

  if (isLoading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!service) {

    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-lg rounded-3xl">
          <CardContent className="p-10 text-center">
            <Building2 className="mx-auto h-14 w-14 text-muted-foreground" />
            <h2 className="mt-5 text-2xl font-bold">
              Service Not Found
            </h2>
            <p className="mt-2 text-muted-foreground">
              The requested service does not exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">

        <div className="rounded-3xl border bg-background p-8 shadow-sm">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="space-y-4">

              <Badge className="rounded-full px-4 py-1">
                Government eService
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight">
                {service.name}
              </h1>

              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {service.description ||
                  "This service is available through the Mesob Adama enterprise eService platform."}
              </p>

              <div className="flex flex-wrap gap-3">

                <Badge variant="secondary" className="rounded-full">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Secure Digital Service
                </Badge>

                <Badge variant="outline" className="rounded-full">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Dynamic Application Workflow
                </Badge>

              </div>
            </div>

            <div className="flex flex-col gap-3">

              <Link href={`/services/${service.id}/apply`}>
                <Button size="lg" className="w-full rounded-2xl">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl"
              >
                Track Application
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-5 w-5" />
                Processing Time
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                3–7 Working Days
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Service Fee
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                {service.service_fee > 0
                  ? `${service.service_fee} ETB`
                  : "Free Service"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Valid Identification</li>
                <li>• Supporting Documents</li>
                <li>• Correct Application Information</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Application Workflow</CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid gap-6 md:grid-cols-5">

              {[
                "Submit",
                "Front Officer",
                "Back Officer",
                "Manager Approval",
                "Completed",
              ].map((step, index) => (

                <div
                  key={step}
                  className="relative rounded-2xl border bg-muted/40 p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>

                  <h3 className="font-semibold">
                    {step}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Enterprise government workflow stage.
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            <div className="flex justify-end">

              <Link href={`/services/${service.id}/apply`}>
                <Button size="lg" className="rounded-2xl">
                  Continue Application
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
