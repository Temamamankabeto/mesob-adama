"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboard } from "@/lib/mesob-api";

// --- NEW SECTION BASED NAV ---
const navSections = [
  {
    title: "Core",
    items: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    title: "User Management",
    items: [
      { label: "Users", href: "/dashboard/users", permission: "users.read" },
      { label: "Roles", href: "/dashboard/roles", permission: "roles.read" },
      { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read" },
    ],
  },
  {
    title: "Service Management",
    items: [
      { label: "Service Requests", href: "/dashboard/service-requests", permission: "requests.read" },
      { label: "Assigned Tasks", href: "/dashboard/assigned-requests", role: "officer" },
      { label: "My Applications", href: "/dashboard/my-applications", role: "customer" },
    ],
  },
  {
    title: "Customer Management",
    items: [
      { label: "Customers", href: "/dashboard/customers", permission: "customers.read" },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "Reports", href: "/dashboard/reports", permission: "reports.city" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Logs", href: "/dashboard/audit-logs", permission: "audit_logs.read" },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("mesob_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setRoles(JSON.parse(localStorage.getItem("roles") || "[]"));
    setPermissions(JSON.parse(localStorage.getItem("permissions") || "[]"));

    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.clear();
    router.replace("/login");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex">
      {/* SIDEBAR */}
      <aside className={`border-r bg-white ${collapsed ? "w-20" : "w-72"}`}>
        <div className="p-4 flex justify-between">
          <span className="font-bold">MESOB</span>
          <button onClick={() => setCollapsed(!collapsed)}>{collapsed ? ">" : "<"}</button>
        </div>

        <nav className="p-4 space-y-4">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item: any) => {
              if (!item.permission && !item.role) return true;
              return (
                permissions.includes(item.permission) ||
                roles.includes(item.role)
              );
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                <p className="text-xs text-muted-foreground mb-2">{section.title}</p>
                {visibleItems.map((item: any) => (
                  <Link key={item.href} href={item.href} className="block px-3 py-2 rounded hover:bg-accent">
                    {item.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <Card title="Users" value={data?.total_users} />
          <Card title="Customers" value={data?.total_customers} />
          <Card title="Requests" value={data?.total_requests} />
          <Card title="Pending" value={data?.pending_requests} />
        </div>
      </main>
    </div>
  );
}

function Card({ title, value }: any) {
  return <div className="bg-white p-4 rounded shadow"><p>{title}</p><h2 className="text-2xl">{value || 0}</h2></div>;
}
