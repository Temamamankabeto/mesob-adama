"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Layers3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/auth/auth.service";
import { normalizeRoleName } from "@/config/roles.config";
import { usePublicService } from "@/hooks/public-service/use-public-service";

function selectionQuery(searchParams: URLSearchParams) {
  const params = new URLSearchParams();

  ["administrative_level", "city_id", "subcity_id", "woreda_id"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  });

  return params.toString();
}

function formatAvailability(availability: any) {
  if (!availability) return "This service has no public availability configured.";

  if (typeof availability === "string") {
    try {
      availability = JSON.parse(availability);
    } catch {
      return availability;
    }
  }

  const levels = availability.levels || availability.administrative_levels || [];
  const parts = [];

  if (levels.length) parts.push(`Available levels: ${levels.join(", ")}`);
  if (availability.city_ids?.length) parts.push(`Selected cities: ${availability.city_ids.join(", ")}`);
  if (availability.subcity_ids?.length) parts.push(`Selected subcities: ${availability.subcity_ids.join(", ")}`);
  if (availability.woreda_ids?.length) parts.push(`Selected woredas: ${availability.woreda_ids.join(", ")}`);

  return parts.length ? parts.join(" · ") : "Available for configured locations.";
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = Number(params.id);
  const { data, isLoading } = usePublicService(id);

  const service = data?.data;
  const selectedLevel = searchParams.get("administrative_level");
  const applyQuery = selectionQuery(searchParams);
  const applyUrl = `/services/${id}/apply${applyQuery ? `?${applyQuery}` : ""}`;

  function handleApply() {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("mesob_token")
        : null;

    const roles = authService.getStoredRoles();
    const role = normalizeRoleName(roles[0] || authService.getStoredUser()?.role || "");

    if (!token) {
      toast.error("Please login or register as a customer before applying.");
      router.push(`/login?redirect=${encodeURIComponent(applyUrl)}`);
      return;
    }

    if (role !== "customer") {
      toast.error("Only customers can apply for public services. Please login with a customer account.");
      router.push(`/login?redirect=${encodeURIComponent(applyUrl)}`);
      return;
    }

    router.push(applyUrl);
  }

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
            <h2 className="mt-5 text-2xl font-bold">Service Not Found</h2>
            <p className="mt-2 text-muted-foreground">The requested service does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="rounded-3xl border bg-background p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Badge className="rounded-full px-4 py-1">Government eService</Badge>

              <h1 className="text-4xl font-bold tracking-tight">{service.name}</h1>

              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {service.description || "This service is available through the Mesob Adama enterprise eService platform."}
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

                {selectedLevel && (
                  <Badge variant="outline" className="rounded-full capitalize">
                    <MapPin className="mr-2 h-4 w-4" />
                    {selectedLevel} level
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex min-w-[260px] flex-col gap-3">
              <Button type="button" size="lg" className="w-full rounded-2xl" onClick={handleApply}>
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <Link href="/services">Change Location</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl lg:col-span-2">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="mt-2 leading-7 text-muted-foreground">
                  {service.description || "No detailed description was provided for this service."}
                </p>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <Clock3 className="h-4 w-4" />
                    Processing Time
                  </div>
                  <p className="text-sm text-muted-foreground">3–7 Working Days</p>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <CreditCard className="h-4 w-4" />
                    Service Fee
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Number(service.service_fee || 0) > 0 ? `${service.service_fee} ETB` : "Free Service"}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <BadgeCheck className="h-4 w-4" />
                    Back Officer
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.has_back_officer ? "Required" : "Not Required"}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4" />
                    Status
                  </div>
                  <p className="text-sm capitalize text-muted-foreground">{service.status || "active"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold">Availability</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {formatAvailability(service.availability)}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold">Required Information</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Valid customer account and contact information.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Correct service form information.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Required files or supporting documents if requested by the form.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Application Workflow</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {[
                "Customer submits application",
                "Front Officer accepts and reviews",
                service.has_back_officer ? "Front Officer forwards to Back Officer" : "Front Officer completes directly",
                service.has_back_officer ? "Back Officer approves or rejects" : "Workflow ends after completion",
                service.has_back_officer ? "Front Officer completes after approval" : null,
              ].filter(Boolean).map((step, index) => (
                <div key={String(step)} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm text-muted-foreground">{step}</p>
                </div>
              ))}

              <Separator />

              <Button type="button" className="w-full rounded-2xl" onClick={handleApply}>
                Start Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
