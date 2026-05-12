"use client";

import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Users,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Layers,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

/* ==============================
   FILTER OPTIONS (eService)
============================== */

const centers = ["all", "Center A", "Center B", "Center C", "Center D"];
const windows = ["all", "Window 1", "Window 2", "Window 3", "Window 4"];
const services = ["all", "Permit", "License", "Certificate", "Support"];
const officers = ["all", "Officer 1", "Officer 2", "Officer 3"];

/* ==============================
   BASE DATA (SIMULATED eService)
============================== */

const requestTrend = [
  { day: "Mon", requests: 40, approved: 25 },
  { day: "Tue", requests: 70, approved: 50 },
  { day: "Wed", requests: 55, approved: 30 },
  { day: "Thu", requests: 90, approved: 65 },
  { day: "Fri", requests: 120, approved: 80 },
  { day: "Sat", requests: 80, approved: 60 },
  { day: "Sun", requests: 60, approved: 45 },
];

const serviceDistribution = [
  { name: "Permit", value: 320 },
  { name: "License", value: 280 },
  { name: "Certificate", value: 400 },
  { name: "Support", value: 180 },
];

const statusData = [
  { name: "Approved", value: 2890 },
  { name: "Pending", value: 420 },
  { name: "Rejected", value: 110 },
];

const windowPerformance = [
  { name: "Window 1", value: 120 },
  { name: "Window 2", value: 90 },
  { name: "Window 3", value: 150 },
  { name: "Window 4", value: 70 },
];

const userGrowth = [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 700 },
  { month: "Mar", users: 900 },
  { month: "Apr", users: 1200 },
  { month: "May", users: 1600 },
];

/* ==============================
   COLORS
============================== */

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

/* ==============================
   COMPONENT
============================== */

export default function EServiceDashboard() {
  const [filters, setFilters] = useState({
    center: "all",
    window: "all",
    service: "all",
    officer: "all",
  });

  /* ==============================
     FILTER LOGIC (SIMULATION)
  ============================== */

  const filteredRequests = useMemo(() => {
    // Replace with API filtering in real system
    return requestTrend;
  }, [filters]);

  return (
    <div className="p-6 bg-[#f5f6fa] min-h-screen space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          eService Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Power BI style multi-filter service monitoring system
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

        <select
          className="p-2 border rounded"
          value={filters.center}
          onChange={(e) =>
            setFilters({ ...filters, center: e.target.value })
          }
        >
          {centers.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={filters.window}
          onChange={(e) =>
            setFilters({ ...filters, window: e.target.value })
          }
        >
          {windows.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={filters.service}
          onChange={(e) =>
            setFilters({ ...filters, service: e.target.value })
          }
        >
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={filters.officer}
          onChange={(e) =>
            setFilters({ ...filters, officer: e.target.value })
          }
        >
          {officers.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card><CardContent className="p-4 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Users</p>
            <h2 className="text-xl font-bold">12,450</h2>
          </div>
          <Users className="text-blue-500" />
        </CardContent></Card>

        <Card><CardContent className="p-4 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Requests</p>
            <h2 className="text-xl font-bold">3,420</h2>
          </div>
          <FileText className="text-green-500" />
        </CardContent></Card>

        <Card><CardContent className="p-4 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Centers</p>
            <h2 className="text-xl font-bold">4</h2>
          </div>
          <Building2 className="text-purple-500" />
        </CardContent></Card>

        <Card><CardContent className="p-4 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Services</p>
            <h2 className="text-xl font-bold">138</h2>
          </div>
          <Layers className="text-orange-500" />
        </CardContent></Card>

      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* REQUEST TREND */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Requests Flow</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={filteredRequests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area dataKey="requests" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area dataKey="approved" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* STATUS PIE */}
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" outerRadius={90}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SERVICE DISTRIBUTION */}
        <Card>
          <CardHeader><CardTitle>Services</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={serviceDistribution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* WINDOWS */}
        <Card>
          <CardHeader><CardTitle>Windows</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={windowPerformance} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* USER GROWTH */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <LineChart data={userGrowth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="users" stroke="#8b5cf6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}