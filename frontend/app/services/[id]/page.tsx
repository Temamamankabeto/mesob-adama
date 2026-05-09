"use client";

import { useParams } from "next/navigation";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Layers3,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { usePublicService } from "@/hooks/public-service/use-public-service";
import Link from "next/link";

export default function ServiceDetailPage() {

  const params = useParams();

  const id = Number(params.id);

  const {
    data,
    isLoading,
  } = usePublicService(id);

  const service =
    data?.data;

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-background">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          <p className="mt-4 text-sm text-muted-foreground">

            Loading service...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!service) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-background">

        <Card className="w-full max-w-md rounded-3xl">

          <CardContent className="p-10 text-center">

            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />

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
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="border-b border-border bg-muted/30">

        <div className="container mx-auto px-4 py-14">

          <div className="mx-auto max-w-6xl">

            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

              {/* LEFT */}
              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">

                  <ShieldCheck className="h-4 w-4 text-primary" />

                  <span className="text-sm font-medium text-muted-foreground">

                    Government Digital Service
                  </span>
                </div>

                <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">

                  {service.name}
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">

                  {
                    service.description ||
                    "This government service is available digitally for citizens and organizations."
                  }
                </p>

                {/* AVAILABILITY */}
                <div className="mt-8 flex flex-wrap gap-2">

                  {service.availability?.map(
                    (
                      item: string
                    ) => (

                      <Badge
                        key={item}
                        variant="secondary"
                        className="rounded-full px-3 py-1 capitalize"
                      >

                        <MapPin className="mr-1 h-3 w-3" />

                        {item}
                      </Badge>
                    )
                  )}
                </div>

                {/* QUICK STATS */}
                <div className="mt-10 grid gap-4 sm:grid-cols-3">

                  <Card className="rounded-2xl">

                    <CardContent className="p-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-primary/10 p-3 text-primary">

                          <CreditCard className="h-5 w-5" />
                        </div>

                        <div>

                          <p className="text-xs text-muted-foreground">

                            Service Fee
                          </p>

                          <h3 className="text-lg font-bold">

                            ETB {
                              service.service_fee
                            }
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">

                    <CardContent className="p-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-primary/10 p-3 text-primary">

                          <Layers3 className="h-5 w-5" />
                        </div>

                        <div>

                          <p className="text-xs text-muted-foreground">

                            Workflow Steps
                          </p>

                          <h3 className="text-lg font-bold">

                            {
                              service.windows
                                ?.length
                            }
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">

                    <CardContent className="p-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-primary/10 p-3 text-primary">

                          <Clock3 className="h-5 w-5" />
                        </div>

                        <div>

                          <p className="text-xs text-muted-foreground">

                            Processing
                          </p>

                          <h3 className="text-lg font-bold">

                            Fast
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* RIGHT */}
              <div>

                <Card className="sticky top-24 rounded-3xl border-border shadow-sm">

                  <CardContent className="p-6">

                    <h3 className="text-xl font-bold">

                      Service Information
                    </h3>

                    <Separator className="my-5" />

                    <div className="space-y-5">

                      <div className="flex items-center justify-between">

                        <span className="text-muted-foreground">

                          Service Status
                        </span>

                        <Badge className="capitalize">

                          <BadgeCheck className="mr-1 h-3 w-3" />

                          {
                            service.status
                          }
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-muted-foreground">

                          Back Officer
                        </span>

                        <span className="text-sm font-medium">

                          {
                            service.has_back_officer
                              ? "Required"
                              : "Not Required"
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-muted-foreground">

                          Windows
                        </span>

                        <span className="font-semibold">

                          {
                            service.windows
                              ?.length
                          }
                        </span>
                      </div>
                    </div>

                    <Link href={`/services/${service.id}/apply`}>
  <Button className="mt-8 h-11 w-full rounded-2xl">
    Apply Service
    <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
</Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-14">

        <div className="container mx-auto px-4">

          <div className="mx-auto max-w-6xl">

            <div className="mb-8">

              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">

                <Layers3 className="h-4 w-4 text-primary" />

                <span className="text-sm font-medium">

                  Workflow Process
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black">

                Service Workflow
              </h2>

              <p className="mt-2 text-muted-foreground">

                Complete the following workflow steps to process your service request.
              </p>
            </div>

            <div className="space-y-5">

              {service.windows?.map(
                (
                  window: any,
                  index: number
                ) => (

                  <Card
                    key={window.id}
                    className="rounded-3xl border-border"
                  >

                    <CardContent className="p-6">

                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        {/* LEFT */}
                        <div className="flex items-start gap-5">

                          {/* STEP */}
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">

                            {index + 1}
                          </div>

                          {/* INFO */}
                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-xl font-bold">

                                {window.name}
                              </h3>

                              {window.pivot
                                ?.is_required && (

                                <Badge
                                  variant="secondary"
                                  className="rounded-full"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">

                              Complete this workflow step before continuing.
                            </p>

                            {/* AVAILABILITY */}
                            <div className="mt-4 flex flex-wrap gap-2">

                              {window.availability?.map(
                                (
                                  item: string
                                ) => (

                                  <Badge
                                    key={item}
                                    variant="outline"
                                    className="rounded-full capitalize"
                                  >
                                    {item}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div>

                          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">

                            <CheckCircle2 className="h-4 w-4" />

                            <span className="text-sm font-medium">

                              Step {
                                index + 1
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}