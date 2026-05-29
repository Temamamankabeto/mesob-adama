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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

type ServiceApplication = {
  id: number | string;
  tracking_number?: string | null;
  service_id?: number | string | null;
  status?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;

  service?: {
    id?: number | string;
    name?: string | null;
  } | null;
};

function numberValue(value: unknown) {
  return Number(value || 0);
}

function getCount(
  source: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return numberValue(source[key]);
    }
  }

  return 0;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString();
}

function titleCase(value?: string | null) {
  return String(value || "-").replaceAll("_", " ");
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
    shared: "bg-purple-50 text-purple-700",
    returned: "bg-orange-50 text-orange-700",
    escalated: "bg-rose-50 text-rose-700",
  };

  return colors[key] || "bg-muted text-muted-foreground";
}

const statusCards = [
  { key: "total", label: "Total", icon: FileText },
  { key: "pending", label: "Pending", icon: Clock3 },
  { key: "submitted", label: "Submitted", icon: FileText },
  { key: "under_review", label: "Under Review", icon: SearchCheck },
  { key: "appointed", label: "Appointed", icon: CalendarCheck2 },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "completed", label: "Completed", icon: BadgeCheck },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "shared", label: "Shared", icon: ArrowRight },
  { key: "returned", label: "Returned", icon: Clock3 },
  { key: "escalated", label: "Escalated", icon: ArrowRight },
];

export default function DashboardPage() {
  const {
    data,
    isLoading,
    error,
  } = useDashboardOverview();

  const {
    data: recentData,
    isLoading: recentLoading,
  } = useCustomerApplications({
    page: 1,
  });

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

  const status = data.status_counts || {};

  const overview =
    data as unknown as Record<string, unknown>;

  const isCustomer = String(data.profile.role)
    .toLowerCase()
    .includes("customer");

  if (!isCustomer) {
    const recentApplications = data.recent_applications || [];
    const recentUsers = data.recent_users || [];

    const moduleCards = [
      { label: "Active Users", value: modules.active_users, icon: Users },
      { label: "Inactive Users", value: modules.inactive_users, icon: Users },
      { label: "Active Services", value: modules.active_services, icon: FileText },
      { label: "Inactive Services", value: modules.inactive_services, icon: FileText },
      { label: "Windows", value: modules.windows, icon: PanelsTopLeft },
      { label: "Form Sections", value: modules.form_sections, icon: FileText },
      { label: "Form Fields", value: modules.form_fields, icon: FileText },
      { label: "Appointments", value: modules.appointments, icon: CalendarCheck2 },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {dashboard.title}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
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
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.cards.map((card) => (
            <Card
              key={card.key}
              className="rounded-3xl"
            >
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold">
                  {card.value}
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {statusCards.map((card) => {
            const CardIcon = card.icon;

            return (
              <Card key={card.key} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${getStatusColor(card.key)}`}>
                    <CardIcon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{numberValue(status[card.key])}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((item) => {
            const ItemIcon = item.icon;

            return (
              <Card key={item.label} className="rounded-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <ItemIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold">{numberValue(item.value)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="rounded-[2rem] shadow-sm">
            <CardHeader className="flex flex-col gap-3 border-b md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest applications inside your access scope.
                </p>
              </div>

              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/dashboard/service-applications">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recentApplications.length ? (
                      recentApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.tracking_number || "-"}</TableCell>
                          <TableCell>{application.service_name || "-"}</TableCell>
                          <TableCell>{application.customer_name || "-"}</TableCell>
                          <TableCell>
                            <ApplicationStatusBadge status={application.status || "-"} />
                          </TableCell>
                          <TableCell>{formatDate(application.submitted_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                              <Link href={`/dashboard/service-applications/${application.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          No recent applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[2rem] shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 p-5">
                {(data.quick_links || []).length ? (
                  data.quick_links.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant="outline"
                      className="h-12 w-full justify-between rounded-2xl px-4"
                    >
                      <Link href={item.href}>
                        <span>{item.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No quick links available.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {recentUsers.length ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="rounded-2xl border p-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email || "-"}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="capitalize">{titleCase(user.role)}</span>
                        <span className={user.is_active ? "text-green-600" : "text-red-600"}>
                          {user.is_active ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent users found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  const customerStatusCards = [
    {
      label: "Total",
      value: numberValue(status.total),
      icon: FileText,
      href: "/dashboard/my-applications",
      className: "bg-blue-50 text-blue-700",
    },
    {
      label: "Pending",
      value: numberValue(status.pending),
      icon: Clock3,
      href: "/dashboard/my-applications?status=pending",
      className: "bg-amber-50 text-amber-700",
    },
    {
      label: "Under Review",
      value: numberValue(status.under_review),
      icon: SearchCheck,
      href: "/dashboard/my-applications?status=under_review",
      className: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Appointed",
      value: numberValue(status.appointed),
      icon: CalendarCheck2,
      href: "/dashboard/my-applications?status=appointed",
      className: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Approved",
      value: numberValue(status.approved),
      icon: CheckCircle2,
      href: "/dashboard/my-applications?status=approved",
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Completed",
      value: numberValue(status.completed),
      icon: BadgeCheck,
      href: "/dashboard/my-applications?status=completed",
      className: "bg-green-50 text-green-700",
    },
    {
      label: "Rejected",
      value: numberValue(status.rejected),
      icon: XCircle,
      href: "/dashboard/my-applications?status=rejected",
      className: "bg-red-50 text-red-700",
    },
  ];

  const recentApplications: ServiceApplication[] =
    ((recentData?.data || []) as ServiceApplication[]).slice(
      0,
      5
    );

  const quickAccessItems = [
    {
      label: "New Application",
      href: "/services",
      icon: PlusCircle,
      count: null,
    },
    {
      label: "Appointments",
      href: "/dashboard/appointments",
      icon: CalendarCheck2,
      count: getCount(overview, [
        "appointments",
        "appointment_count",
        "appointments_count",
      ]),
    },
    {
      label: "Pending Payments",
      href: "/dashboard/payments?status=pending",
      icon: CreditCard,
      count: getCount(overview, [
        "pending_payments",
        "pending_payment_count",
      ]),
    },
    {
      label: "Paid Payments",
      href: "/dashboard/payments?status=paid",
      icon: CheckCircle2,
      count: getCount(overview, [
        "paid_payments",
        "paid_payment_count",
      ]),
    },
    {
      label: "Complaints & Feedback",
      href: "/dashboard/complaints-feedback",
      icon: MessageSquareText,
      count: getCount(overview, [
        "complaints",
        "complaints_count",
        "feedback_count",
      ]),
    },
    {
      label: "Help & Support",
      href: "/dashboard/help-support",
      icon: Headphones,
      count: null,
    },
  ];

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border bg-cover bg-center p-6 text-white shadow-sm md:p-8"
        style={{
          backgroundImage:
            "url('/images/adama-clear-city-night.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-950/10" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-white/75">
              Adama City Masob eService
            </p>

            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Welcome back, {data.profile.name}! 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/85">
              Track your applications, follow office
              decisions, and access your municipal services
              from one secure dashboard.
            </p>

            <div className="mt-5 inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              All Systems Operational
            </div>
          </div>

          <Button
            asChild
            className="rounded-2xl bg-white text-blue-950 hover:bg-white/90"
          >
            <Link href="/services">
              New Application

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {customerStatusCards.map((card) => {
          const CardIcon = card.icon;

          return (
            <Link
              key={card.label}
              href={card.href}
              className="block"
            >
              <Card className="rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4">
                  <div
                    className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${card.className}`}
                  >
                    <CardIcon className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-medium text-muted-foreground">
                    {card.label}
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-[2rem] shadow-sm">
          <CardHeader className="flex flex-col gap-3 border-b md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>
                Recent Applications
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Latest submitted applications and tracking
                status.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="rounded-2xl"
            >
              <Link href="/dashboard/my-applications">
                View All

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Tracking Number
                    </TableHead>

                    <TableHead>
                      Service Name
                    </TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>
                      Submitted Date
                    </TableHead>

                    <TableHead>
                      Last Updated
                    </TableHead>

                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center"
                      >
                        Loading recent applications...
                      </TableCell>
                    </TableRow>
                  ) : recentApplications.length ? (
                    recentApplications.map(
                      (application) => (
                        <TableRow
                          key={application.id}
                        >
                          <TableCell className="font-medium">
                            {application.tracking_number ||
                              "-"}
                          </TableCell>

                          <TableCell>
                            {application.service?.name ||
                              application.service_id ||
                              "-"}
                          </TableCell>

                          <TableCell>
                            <ApplicationStatusBadge
                              status={
                                application.status
                              }
                            />
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              application.submitted_at
                            )}
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              application.updated_at
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Link
                                href={`/dashboard/my-applications/${application.id}`}
                              >
                                <Eye className="mr-2 h-4 w-4" />

                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No recent applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Quick Access</CardTitle>

            <p className="text-sm text-muted-foreground">
              Frequently used customer actions.
            </p>
          </CardHeader>

          <CardContent className="space-y-3 p-5">
            {quickAccessItems.map((item) => {
              const ItemIcon = item.icon;

              return (
                <Button
                  key={item.label}
                  asChild
                  variant="outline"
                  className="h-12 w-full justify-between rounded-2xl px-4"
                >
                  <Link href={item.href}>
                    <span className="flex items-center gap-3">
                      <ItemIcon className="h-4 w-4" />

                      <span>{item.label}</span>
                    </span>

                    <span className="flex items-center gap-2">
                      {item.count !== null ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                          {item.count}
                        </span>
                      ) : null}

                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}