"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardForRole } from "@/config/dashboard.config";
import { useDashboardOverview } from "@/hooks/dashboard/use-dashboard";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-red-600">
        Failed to load dashboard.
      </div>
    );
  }

  const dashboard = getDashboardForRole(data.profile.role);
  const Icon = dashboard.icon;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">{dashboard.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{dashboard.subtitle}</p>
              <p className="mt-2 text-sm font-medium">
                {data.profile.role_label}
                {data.profile.scope_label ? ` · ${data.profile.scope_label}` : ""}
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {data.profile.city || "System"}
            {data.profile.subcity ? ` / ${data.profile.subcity}` : ""}
            {data.profile.woreda ? ` / ${data.profile.woreda}` : ""}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.cards.map((card) => (
          <Card key={card.key} className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl xl:col-span-2">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.status_counts).map(([status, value]) => (
                <div key={status} className="rounded-2xl border p-4">
                  <p className="text-sm capitalize text-muted-foreground">
                    {status.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {data.quick_links.length ? (
              data.quick_links.map((link) => (
                <Button key={link.href} asChild variant="outline" className="w-full justify-between rounded-2xl">
                  <Link href={link.href}>
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No quick links available for your permissions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
