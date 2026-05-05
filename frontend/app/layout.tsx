"use client";

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: "MESOB eService",
  description: "Government eService system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const roles = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("roles") || "[]") : [];
  const permissions = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("permissions") || "[]") : [];

  const navSections = [
    { title: "Main", items: [{ label: "Dashboard", href: "/dashboard" }] },
    {
      title: "User Management",
      items: [
        { label: "Users", href: "/dashboard/users", permission: "users.read" },
        { label: "Roles", href: "/dashboard/roles", permission: "roles.read" },
        { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read" },
      ],
    },
    {
      title: "Customer Management",
      items: [
        { label: "Customers", href: "/dashboard/customers", permission: "customers.read" },
      ],
    },
    {
      title: "Service Management",
      items: [
        { label: "Service Requests", href: "/dashboard/service-requests", permission: "requests.read" },
        { label: "Assigned Requests", href: "/dashboard/assigned-requests", role: "officer" },
        { label: "My Applications", href: "/dashboard/my-applications", role: "customer" },
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

  function canShow(item: any) {
    if (!item.permission && !item.role) return true;
    return permissions.includes(item.permission) || roles.includes(item.role);
  }

  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen bg-muted/40">
            <aside className="w-64 border-r bg-white p-4">
              <h2 className="text-lg font-bold mb-6">MESOB eService</h2>
              {navSections.map((section) => {
                const visible = section.items.filter(canShow);
                if (!visible.length) return null;
                return (
                  <div key={section.title} className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2 uppercase">{section.title}</p>
                    <div className="space-y-1">
                      {visible.map((item) => (
                        <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </aside>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
