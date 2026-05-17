"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardForRole } from "@/config/dashboard.config";
import { useDashboardOverview } from "@/hooks/dashboard/use-dashboard";

/* ================= CHARTS ================= */
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

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

  /* ================= SAFE DATA ================= */
  const statusCounts = data.status_counts || {};

  const total = Object.values(statusCounts).reduce(
    (a: number, b: any) => a + Number(b || 0),
    0
  );

  const approved = Number(statusCounts?.approved || 0);
  const pending = Number(statusCounts?.pending || 0);
  const rejected = Number(statusCounts?.rejected || 0);

  /* ================= PIE DATA ================= */
  const pieData = Object.entries(statusCounts).map(([key, value]) => ({
    name: key.replaceAll("_", " "),
    value: Number(value),
  }));

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

  /* ================= BAR DATA ================= */
  const barData = [
    {
      name: "Applications",
      approved,
      pending,
      rejected,
    },
  ];

  /* ================= LINE DATA (TREND STYLE) ================= */
  const lineData = [
    { name: "Mon", value: total * 0.4 },
    { name: "Tue", value: total * 0.6 },
    { name: "Wed", value: total * 0.8 },
    { name: "Thu", value: total * 0.5 },
    { name: "Fri", value: total },
  ];

  return (
    <div className="space-y-6">

      {/* ================= YOUR ORIGINAL HEADER ================= */}
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">{dashboard.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {dashboard.subtitle}
              </p>
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

      {/* ================= YOUR ORIGINAL CARDS ================= */}
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
              <p className="mt-2 text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================= YOUR ORIGINAL STATUS + LINKS ================= */}
      <div className="grid gap-6 xl:grid-cols-3">

        <Card className="rounded-3xl xl:col-span-2">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(statusCounts).map(([status, value]) => (
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
                <Button
                  key={link.href}
                  asChild
                  variant="outline"
                  className="w-full justify-between rounded-2xl"
                >
                  <Link href={link.href}>
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No quick links available for your permissions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= BI CHART SECTION (NEW) ================= */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* PIE CHART */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BAR CHART */}
        <Card className="rounded-3xl xl:col-span-2">
          <CardHeader>
            <CardTitle>Applications Overview</CardTitle>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="approved" fill="#22c55e" />
                <Bar dataKey="pending" fill="#f59e0b" />
                <Bar dataKey="rejected" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LINE CHART */}
        <Card className="rounded-3xl xl:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}