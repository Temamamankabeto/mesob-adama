import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
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

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export type RoleSidebar = {
  title: string;
  icon: LucideIcon;
  sections: SidebarSection[];
};

const s = (title: string, items: SidebarItem[]): SidebarSection => ({ title, items });

const dashboardItem = (role: AppRoleKey): SidebarItem => ({
  label: "Dashboard",
  href: dashboardConfig[role].route,
  icon: LayoutDashboard,
});

const userManagementMenu: SidebarItem = {
  label: "User Management",
  icon: Users,
  children: [
    { label: "Users", href: "/dashboard/users", permission: "users.read", scopes: ["super_admin", "admin:city", "admin:subcity", "admin:woreda", "manager:city", "manager:subcity", "manager:woreda"] },
    { label: "Create User", href: "/dashboard/users/add", permission: "users.create", scopes: ["super_admin", "admin:city", "admin:subcity", "admin:woreda"] },
    { label: "Activation Requests", href: "/dashboard/user-activation-requests", permission: "users.activate", scopes: ["admin:city", "admin:subcity", "admin:woreda"] },
    { label: "Roles", href: "/dashboard/roles", permission: "roles.read", scopes: ["super_admin", "admin:city"] },
    { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read", scopes: ["super_admin", "admin:city"] },
  ],
};

const locationManagementMenu: SidebarItem = {
  label: "Location Management",
  icon: Map,
  scopes: ["super_admin", "admin:city"],
  children: [
    { label: "Locations", href: "/dashboard/locations", permission: "cities.read", scopes: ["super_admin", "admin:city"] },
    { label: "Cities", href: "/dashboard/locations/cities", permission: "cities.read", scopes: ["super_admin"] },
    { label: "Subcities", href: "/dashboard/locations/subcities", permission: "subcities.read", scopes: ["super_admin", "admin:city"] },
    { label: "Woredas", href: "/dashboard/locations/woredas", permission: "woredas.read", scopes: ["super_admin", "admin:city"] },
  ],
};

const serviceManagementMenu: SidebarItem = {
  label: "Service Management",
  icon: Building2,
  scopes: ["super_admin", "admin:city", "manager:city"],
  children: [
    { label: "Services", href: "/dashboard/services", permission: "services.read", scopes: ["super_admin", "admin:city", "manager:city"] },
    { label: "User Services", href: "/dashboard/user-services", permission: "services.read", scopes: ["super_admin", "admin:city"] },
    { label: "Officer Services", href: "/dashboard/services/officers", permission: "services.read", scopes: ["super_admin", "admin:city"] },
  ],
};

const windowManagementMenu: SidebarItem = {
  label: "Window Management",
  icon: Workflow,
  scopes: ["super_admin", "admin:city", "manager:city"],
  children: [
    { label: "Windows", href: "/dashboard/windows", permission: "windows.read", scopes: ["super_admin", "admin:city", "manager:city"] },
    { label: "Service Windows", href: "/dashboard/service-window", permission: "windows.read", scopes: ["super_admin", "admin:city"] },
    { label: "Window Assignment", href: "/dashboard/service-window/lists", permission: "windows.read", scopes: ["super_admin", "admin:city"] },
  ],
};

const formBuilderMenu: SidebarItem = {
  label: "Form Builder",
  icon: ClipboardList,
  scopes: ["super_admin", "admin:city", "manager:city"],
  children: [
    { label: "Service Forms", href: "/dashboard/service-forms", permission: "service_forms.read", scopes: ["super_admin", "admin:city", "manager:city"] },
    { label: "Form Sections", href: "/dashboard/service-form-sections", permission: "service_forms.read", scopes: ["super_admin", "admin:city", "manager:city"] },
    { label: "Form Steps", href: "/dashboard/service-form-steps", permission: "service_forms.read", scopes: ["super_admin", "admin:city", "manager:city"] },
    { label: "Form Fields", href: "/dashboard/service-form-fields", permission: "service_forms.read", scopes: ["super_admin", "admin:city", "manager:city"] },
    { label: "Field Conditions", href: "/dashboard/service-form-field-conditions", permission: "service_forms.read", scopes: ["super_admin", "admin:city", "manager:city"] },
  ],
};

const applicationManagementMenu: SidebarItem = {
  label: "Applications",
  icon: FileText,
  children: [
    { label: "Application Summary", href: "/dashboard/applications/summary", permission: "applications.summary", scopes: ["super_admin", "admin:city", "admin:subcity", "admin:woreda", "manager:city", "manager:subcity", "manager:woreda"] },
    { label: "Service Applications", href: "/dashboard/service-applications", permission: "service_applications.read", scopes: ["super_admin", "admin:city", "admin:subcity", "admin:woreda", "manager:city", "manager:subcity", "manager:woreda"] },
    { label: "Officer Queue", href: "/dashboard/officer/applications", permission: "service_applications.review", scopes: ["front_officer:city", "front_officer:subcity", "front_officer:woreda", "back_officer:city", "back_officer:subcity", "back_officer:woreda"] },
  ],
};

const officerApplicationMenu: SidebarItem = {
  label: "Officer Applications",
  icon: ClipboardCheck,
  children: [
    { label: "Application Queue", href: "/dashboard/officer/applications", permission: "service_applications.review" },
  ],
};

const customerApplicationMenu: SidebarItem = {
  label: "My Applications",
  icon: FileText,
  children: [
    { label: "Application List", href: "/dashboard/my-applications", permission: "applications.own" },
    { label: "Track Application", href: "/dashboard/track-application", permission: "applications.track" },
  ],
};

const systemMenu: SidebarItem = {
  label: "System",
  icon: Settings,
  scopes: ["super_admin", "admin:city"],
  children: [
    { label: "Audit Logs", href: "/dashboard/audit-logs", permission: "audit_logs.read", scopes: ["super_admin", "admin:city"] },
  ],
};

const adminSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Management", [userManagementMenu, locationManagementMenu, serviceManagementMenu, windowManagementMenu]),
  s("Applications", [formBuilderMenu, applicationManagementMenu]),
  s("System", [systemMenu]),
];

const managerSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Management", [userManagementMenu, serviceManagementMenu, windowManagementMenu]),
  s("Applications", [formBuilderMenu, applicationManagementMenu]),
  s("System", [systemMenu]),
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

    const normalized = String(role || "")
      .toLowerCase()
      .replace(/[-\s]+/g, "_");

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

  const current = currentScopeKey();

  return scopes.includes(current);
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
          if (!item.children?.length) {
            return itemAllowed(item, permissions) ? item : null;
          }

          const children = item.children.filter((child) => childAllowed(child, permissions));

          if (children.length === 0 && !itemAllowed(item, permissions)) return null;

          return { ...item, children };
        })
        .filter(Boolean) as SidebarItem[];

      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
}
