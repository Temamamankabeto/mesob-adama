import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Workflow,
  ClipboardCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  dashboardConfig,
  normalizeRole,
  type AppRoleKey,
} from "@/config/dashboard.config";

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
  scopes?: string[];
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  scopes?: string[];
  children?: SidebarChildItem[];
};

export type SidebarSection = { title: string; items: SidebarItem[] };
export type RoleSidebar = { title: string; icon: LucideIcon; sections: SidebarSection[] };

const s = (title: string, items: SidebarItem[]): SidebarSection => ({ title, items });
const dashboardItem = (role: AppRoleKey): SidebarItem => ({
  label: "Dashboard",
  href: dashboardConfig[role].route,
  icon: LayoutDashboard,
});

const cityOnly = ["super_admin", "admin:city"];

const userManagementMenu: SidebarItem = {
  label: "User Management",
  icon: Users,
  children: [
    { label: "Users", href: "/dashboard/users", permission: "users.read" },
    { label: "Create User", href: "/dashboard/users/add", permission: "users.create" },
    { label: "Activation Requests", href: "/dashboard/user-activation-requests", permission: "users.activate" },
    { label: "Roles", href: "/dashboard/roles", permission: "roles.read", scopes: cityOnly },
    // { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read", scopes: cityOnly },
  ],
};

const serviceManagementMenu: SidebarItem = {
  label: "Service Management",
  icon: Building2,
  scopes: cityOnly,
  children: [
    { label: "Services", href: "/dashboard/services", permission: "services.read", scopes: cityOnly },
    { label: "Officer Services", href: "/dashboard/user-services", permission: "services.read", scopes: cityOnly },
    { label: "Assigned Services", href: "/dashboard/services/officers", permission: "services.read", scopes: cityOnly },
  ],
};

const windowManagementMenu: SidebarItem = {
  label: "Window Management",
  icon: Workflow,
  scopes: cityOnly,
  children: [
    { label: "Windows", href: "/dashboard/windows", permission: "windows.read", scopes: cityOnly },
    { label: "Service Windows", href: "/dashboard/service-window", permission: "windows.read", scopes: cityOnly },
    { label: "Assigned Window", href: "/dashboard/service-window/lists", permission: "windows.read", scopes: cityOnly },
    { label: "Officer Window", href: "/dashboard/window-officer-assignment", permission: "windows.read", scopes: cityOnly },
  ],
};

const formBuilderMenu: SidebarItem = {
  label: "Form Builder",
  icon: ClipboardList,
  scopes: cityOnly,
  children: [
    { label: "Service Forms", href: "/dashboard/service-forms", permission: "service_forms.read", scopes: cityOnly },
    { label: "Form Sections", href: "/dashboard/service-form-sections", permission: "service_forms.read", scopes: cityOnly },
  ],
};

const applicationManagementMenu: SidebarItem = {
  label: "Applications",
  icon: FileText,
  children: [
    { label: "Application Summary", href: "/dashboard/applications/summary", permission: "applications.summary" },
    { label: "Service Applications", href: "/dashboard/service-applications", permission: "service_applications.read" },
    { label: "Officer Queue", href: "/dashboard/officer/applications", permission: "service_applications.review" },
  ],
};

const officerApplicationMenu: SidebarItem = {
  label: "Officer Applications",
  icon: ClipboardCheck,
  children: [{ label: "Application Queue", href: "/dashboard/officer/applications", permission: "service_applications.review" }],
};

const customerApplicationMenu: SidebarItem = {
  label: "My Applications",
  icon: FileText,
  children: [
    { label: "Total Application", href: "/dashboard/my-applications", permission: "applications.own" },
    { label: "Track Application", href: "/dashboard/track-application", permission: "applications.track" },
  ],
};

const systemMenu: SidebarItem = {
  label: "System",
  icon: Settings,
  scopes: cityOnly,
  children: [{ label: "Audit Logs", href: "/dashboard/audit-logs", permission: "audit_logs.read", scopes: cityOnly }],
};

const adminSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Management", [userManagementMenu, serviceManagementMenu, windowManagementMenu]),
  s("Applications", [formBuilderMenu, applicationManagementMenu]),
  s("System", [systemMenu]),
];

const managerSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Applications", [applicationManagementMenu]),
];

const officerSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Applications", [officerApplicationMenu]),
];

const customerSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Applications", [customerApplicationMenu]),
];

export const sidebarConfig: Record<AppRoleKey, RoleSidebar> = {
  "super-admin": { title: "Super Admin", icon: ShieldCheck, sections: adminSections("super-admin") },
  manager: { title: "Manager", icon: ShieldCheck, sections: managerSections("manager") },
  admin: { title: "Admin", icon: ShieldCheck, sections: adminSections("admin") },
  "front-officer": { title: "Front Officer", icon: UserCheck, sections: officerSections("front-officer") },
  "back-officer": { title: "Back Officer", icon: UserCheck, sections: officerSections("back-officer") },
  customer: { title: "Customer", icon: UserCheck, sections: customerSections("customer") },
};

export function getSidebarForRole(role?: string | null): RoleSidebar {
  return sidebarConfig[normalizeRole(role)];
}

function currentScopeKey(): string {
  if (typeof window === "undefined") return "super_admin";
  try {
    const rawUser = localStorage.getItem("user") || localStorage.getItem("mesob_user");
    const rawRoles = localStorage.getItem("roles") || localStorage.getItem("mesob_roles");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const roles = rawRoles ? JSON.parse(rawRoles) : [];
    const role = Array.isArray(roles) ? roles[0] : roles || user.role;
    const normalized = String(role || "").toLowerCase().replace(/[-\s]+/g, "_");
    if (normalized === "super_admin") return "super_admin";
    if (normalized === "customer") return "customer";
    const level = user.location_level || (user.woreda_id ? "woreda" : user.subcity_id ? "subcity" : user.city_id ? "city" : "");
    return level ? `${normalized}:${level}` : normalized;
  } catch {
    return "super_admin";
  }
}

function scopeAllowed(scopes: string[] | undefined): boolean {
  if (!scopes?.length) return true;
  return scopes.includes(currentScopeKey());
}
function childAllowed(child: SidebarChildItem, permissions: string[]): boolean {
  return (!child.permission || permissions.includes(child.permission)) && scopeAllowed(child.scopes);
}
function itemAllowed(item: SidebarItem, permissions: string[]): boolean {
  return (!item.permission || permissions.includes(item.permission)) && scopeAllowed(item.scopes);
}
export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []): SidebarSection[] {
  return roleSidebar.sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          if (!item.children?.length) return itemAllowed(item, permissions) ? item : null;
          const children = item.children.filter((child) => childAllowed(child, permissions));
          if (children.length === 0 && !itemAllowed(item, permissions)) return null;
          return { ...item, children };
        })
        .filter(Boolean) as SidebarItem[];
      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
}
