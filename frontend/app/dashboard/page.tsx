"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Headphones,
  Loader2,
  MessageSquareText,
  PanelsTopLeft,
  PlusCircle,
  SearchCheck,
  Users,
  XCircle,
} from "lucide-react";

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

import { getDashboardForRole } from "@/config/dashboard.config";
import { useCustomerApplications } from "@/hooks/customer/use-customer-applications";
import { useDashboardOverview } from "@/hooks/dashboard/use-dashboard";

/* ---------------- TYPES (SAFE FALLBACKS) ---------------- */

type SafeDashboardResponse = {
  profile?: {
    role?: string;
    name?: string;
  };
  status_counts?: Record<string, number>;
  cards?: Array<{
    key: string;
    label: string;
    value: number;
    description?: string;
  }>;
  quick_links?: Array<{
    href: string;
    label: string;
  }>;
  recent_applications?: any[];
  recent_users?: any[];
};

type ServiceApplication = {
  id: number | string;
  tracking_number?: string | null;
  service_id?: number | string | null;
  status?: string | null;
  submitted_at?: string | null;

  service?: {
    name?: string | null;
  } | null;

  customer_name?: string | null;
};

/* ---------------- HELPERS ---------------- */

function numberValue(value: unknown) {
  return Number(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function getStatusColor(key: string) {
  const colors: Record<string, string> = {
    total: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    submitted: "bg-sky-50 text-sky-700",
    under_review: "bg-indigo-50 text-indigo-700",
    appointed: "bg-cyan-50 text-cyan-700",
    approved: "bg-emerald-50 text-emerald-700",
    completed: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  return colors[key] || "bg-muted text-muted-foreground";
}

/* ---------------- COMPONENT ---------------- */

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardOverview();
  const { data: recentData } = useCustomerApplications({ page: 1 });

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

  const safeData = data as unknown as SafeDashboardResponse;

  const role = safeData.profile?.role || "customer";
  const dashboard = getDashboardForRole(role);
  const Icon = dashboard.icon;

  const status = safeData.status_counts || {};

  const isCustomer = String(role).toLowerCase().includes("customer");

  /* ---------------- ADMIN VIEW ---------------- */

  if (!isCustomer) {
    const recentApplications = safeData.recent_applications || [];
    const recentUsers = safeData.recent_users || [];

    return (
      <div className="space-y-6">

        {/* HEADER */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">{dashboard.title}</h1>
              <p className="text-sm text-muted-foreground">
                {dashboard.subtitle}
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/dashboard/service-applications">
                View Applications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* SIMPLE CARDS (SAFE) */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(safeData.cards || []).map((card) => (
            <Card key={card.key} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">
                  {card.description || "-"}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* RECENT */}
        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(recentApplications || []).map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.tracking_number || "-"}</TableCell>
                      <TableCell>{a.service?.name || "-"}</TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={a.status} />
                      </TableCell>
                      <TableCell>{formatDate(a.submitted_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* USERS */}
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {(recentUsers || []).map((u: any) => (
                <div key={u.id} className="border rounded-xl p-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  /* ---------------- CUSTOMER VIEW ---------------- */

  const recentApplications: ServiceApplication[] =
    (recentData?.data as ServiceApplication[]) || [];

  return (
    <div className="space-y-6">

      <div className="rounded-3xl border bg-card p-6">
        <h1 className="text-2xl font-bold">
          Welcome, {safeData.profile?.name || "User"}
        </h1>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {Object.keys(status).map((key) => (
          <Card key={key} className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{key}</p>
              <p className="text-2xl font-bold">{numberValue(status[key])}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentApplications.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.tracking_number || "-"}</TableCell>
                  <TableCell>{a.service?.name || "-"}</TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={a.status || ""} />
                  </TableCell>
                  <TableCell>{formatDate(a.submitted_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}