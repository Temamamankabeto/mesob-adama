"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { authService } from "@/services/auth/auth.service";
import {
  filterSidebarByPermissions,
  getSidebarForRole,
} from "@/config/sidebar.config";
import { normalizeRole } from "@/config/dashboard.config";
import { locationLevelLabel, roleLabel } from "@/config/roles.config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import mesob from "@/app/mesob.jpg";

type SidebarContentProps = {
  collapsed?: boolean;
};

export default function SidebarContent({
  collapsed = false,
}: SidebarContentProps) {
  const pathname = usePathname();
  const user = authService.getStoredUser();
  const roles = authService.getStoredRoles();
  const role = roles[0] ?? user?.role ?? "super_admin";
  const roleKey = normalizeRole(role);
  const permissions = authService.getStoredPermissions();

  const roleSidebar = useMemo(
    () => getSidebarForRole(roleKey || role),
    [roleKey, role],
  );
  const sections = filterSidebarByPermissions(roleSidebar, permissions);

  const RoleIcon = roleSidebar.icon;
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const locationScope = (user as any)?.location_level
    ? locationLevelLabel((user as any).location_level)
    : (user as any)?.woreda?.name ||
      (user as any)?.subcity?.name ||
      (user as any)?.city?.name ||
      "";

  function toggleMenu(label: string) {
    setOpenMenus((current) => ({ ...current, [label]: !current[label] }));
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-4">
        <div
          className={cn(
            "flex items-center rounded-2xl bg-sidebar-accent p-3",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="rounded-xl bg-sidebar-primary p-2 text-sidebar-primary-foreground">
            <div>
              <Image
                src={mesob}
                alt="Logo"
                width={150}
                height={150}
                className="h-5 w-5"
              />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold">
                ADAMA MESOB eService
              </h1>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {roleLabel(role)}
                {locationScope ? ` · ${locationScope}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-5 overflow-y-auto",
          collapsed ? "p-2" : "p-4",
        )}
      >
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            {!collapsed && (
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? pathname === item.href : false;
                const hasChildren = Boolean(item.children?.length);
                const childIsActive = Boolean(
                  item.children?.some((child) => pathname === child.href),
                );
                const isOpen = openMenus[item.label] ?? childIsActive;

                if (hasChildren) {
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        type="button"
                        title={collapsed ? item.label : undefined}
                        onClick={() => toggleMenu(item.label)}
                        className={cn(
                          "flex w-full items-center rounded-xl text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          collapsed
                            ? "justify-center px-2 py-2"
                            : "gap-2 px-3 py-2",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">
                              {item.label}
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-3 w-3 shrink-0 transition-transform duration-200",
                                isOpen && "rotate-90",
                              )}
                            />
                          </>
                        )}
                      </button>

                      {!collapsed && isOpen && (
                        <div className="ml-6 space-y-1 border-l border-sidebar-border pl-2">
                          {item.children?.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  childActive &&
                                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                                )}
                              >
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href ?? item.label}
                    href={item.href ?? "#"}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-xl text-sm font-medium transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed
                        ? "justify-center px-2 py-2"
                        : "gap-2 px-3 py-2",
                      active &&
                        "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
