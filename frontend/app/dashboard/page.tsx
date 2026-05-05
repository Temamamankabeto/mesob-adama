"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboard } from "@/lib/mesob-api";

type User = {
  id?: number | string;
  name?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  status?: string;
};

type NavItem = {
  label: string;
  href: string;
  roles?: string[];
  permissions?: string[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/dashboard/users", permissions: ["users.read"] },
  { label: "Roles", href: "/dashboard/roles", permissions: ["roles.read"] },
  { label: "Permissions", href: "/dashboard/permissions", permissions: ["permissions.read"] },
  { label: "Customers", href: "/dashboard/customers", permissions: ["customers.read"] },
  { label: "Service Requests", href: "/dashboard/service-requests", permissions: ["requests.read"] },
  { label: "Assigned Tasks", href: "/dashboard/assigned-requests", roles: ["city_front_officer", "city_back_officer", "subcity_front_officer", "subcity_back_officer", "woreda_front_officer", "woreda_back_officer", "officer"] },
  { label: "My Applications", href: "/dashboard/my-applications", roles: ["customer"] },
  { label: "Reports", href: "/dashboard/reports", permissions: ["reports.city", "reports.subcity", "reports.woreda", "reports.officer"] },
  { label: "Audit Logs", href: "/dashboard/audit-logs", permissions: ["audit_logs.read"] },
];

const roleTitles: Record<string, string> = {
  super_admin: "City Super Admin",
  subcity_admin: "Subcity Admin",
  woreda_admin: "Woreda Admin",
  city_front_officer: "City Front Officer",
  city_back_officer: "City Back Officer",
  subcity_front_officer: "Subcity Front Officer",
  subcity_back_officer: "Subcity Back Officer",
  woreda_front_officer: "Woreda Front Officer",
  woreda_back_officer: "Woreda Back Officer",
  officer: "Officer",
  customer: "Customer",
};

function normalize(value?: string) {
  return String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function canShow(item: NavItem, roles: string[], permissions: string[]) {
  if (!item.roles && !item.permissions) return true;
  const normRoles = roles.map(normalize);
  const normPerms = permissions.map(normalize);
  const roleOk = item.roles?.some((role) => normRoles.includes(normalize(role))) ?? false;
  const permOk = item.permissions?.some((permission) => normPerms.includes(normalize(permission))) ?? false;
  return roleOk || permOk;
}

function roleDashboardMessage(role: string) {
  const r = normalize(role);
  if (r === "super_admin") return "City-wide administration, monitoring, reports, users, and configuration.";
  if (r === "subcity_admin") return "Manage users, customers, and service activity inside your assigned subcity.";
  if (r === "woreda_admin") return "Manage woreda officers, customers, and local service request processing.";
  if (r.includes("officer")) return "Review assigned applications, verify documents, process, return, approve, or complete requests.";
  if (r === "customer") return "Submit service applications, track status, receive notifications, and download approved documents.";
  return "MESOB eService digital government service dashboard.";
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
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

    const storedUser = readJson<User | null>("user", null);
    const storedRoles = readJson<string[]>("roles", storedUser?.roles || []);
    const storedPermissions = readJson<string[]>("permissions", storedUser?.permissions || []);
    setUser(storedUser);
    setRoles(storedRoles);
    setPermissions(storedPermissions);

    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const primaryRole = roles[0] || user?.roles?.[0] || "user";
  const visibleNav = useMemo(() => navItems.filter((item) => canShow(item, roles, permissions)), [roles, permissions]);

  function logout() {
    localStorage.clear();
    document.cookie = "token=; Path=/; Max-Age=0";
    document.cookie = "roles=; Path=/; Max-Age=0";
    document.cookie = "permissions=; Path=/; Max-Age=0";
    document.cookie = "user=; Path=/; Max-Age=0";
    router.replace("/login");
  }

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-20 border-r bg-white transition-all ${collapsed ? "w-20" : "w-72"}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && <div><h2 className="font-bold">MESOB</h2><p className="text-xs text-slate-500">Adama eService</p></div>}
          <button onClick={() => setCollapsed(!collapsed)} className="rounded border px-2 py-1 text-sm">{collapsed ? ">" : "<"}</button>
        </div>
        <nav className="space-y-1 p-3">
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {collapsed ? item.label.charAt(0) : item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className={`transition-all ${collapsed ? "ml-20" : "ml-72"}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            <h1 className="text-xl font-bold">{roleTitles[normalize(primaryRole)] || "MESOB Dashboard"}</h1>
            <p className="text-xs text-slate-500">{user?.name || "Logged in user"} · {user?.email || ""}</p>
          </div>
          <button onClick={logout} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Logout</button>
        </header>

        <section className="p-6">
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">{roleTitles[normalize(primaryRole)] || primaryRole}</p>
            <h2 className="mt-2 text-2xl font-bold">Welcome to MESOB eService Platform</h2>
            <p className="mt-2 text-slate-600">{roleDashboardMessage(primaryRole)}</p>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Stat title="Total Users" value={data?.total_users ?? 0} />
                <Stat title="Customers" value={data?.total_customers ?? 0} />
                <Stat title="Service Requests" value={data?.total_requests ?? 0} />
                <Stat title="Pending Requests" value={data?.pending_requests ?? 0} />
                <Stat title="Active Users" value={data?.active_users ?? 0} />
                <Stat title="Suspended Users" value={data?.suspended_users ?? 0} />
                <Stat title="Completed Requests" value={data?.completed_requests ?? 0} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <QuickAction title="Create User" href="/dashboard/users" show={permissions.includes("users.create") || normalize(primaryRole) === "super_admin"} />
                <QuickAction title="Verify Customers" href="/dashboard/customers" show={permissions.includes("customers.verify") || normalize(primaryRole).includes("admin")} />
                <QuickAction title="Process Requests" href="/dashboard/service-requests" show={permissions.includes("requests.review") || normalize(primaryRole).includes("officer")} />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{title}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>;
}

function QuickAction({ title, href, show }: { title: string; href: string; show: boolean }) {
  if (!show) return null;
  return <Link href={href} className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">Open module</p></Link>;
}
