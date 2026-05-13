import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { dashboardConfig, normalizeRole, type AppRoleKey } from "@/config/dashboard.config";

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
};

export type SidebarItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
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

const userManagement: SidebarItem[] = [
  { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
  { label: "Roles", href: "/dashboard/roles", icon: Users, permission: "roles.read" },
];

const locationManagement: SidebarItem[] = [
  { label: "Locations", href: "/dashboard/locations", icon: Map, permission: "cities.read" },
];

const serviceManagement: SidebarItem[] = [
  { label: "Services", href: "/dashboard/services", icon: LayoutDashboard, permission: "services.read" },
  { label: "Service Windows", href: "/dashboard/service-window", icon: LayoutDashboard, permission: "windows.read" },
  { label: "Service Window Management", href: "/dashboard/service-window/lists", icon: LayoutDashboard, permission: "windows.read" },
  { label: "Window", href: "/dashboard/windows", icon: LayoutDashboard, permission: "windows.read" },
  { label: "User Services", href: "/dashboard/user-services", icon: Settings, permission: "services.read" },
  { label: "Officers Services", href: "/dashboard/services/officers", icon: Settings, permission: "services.read" },
];

const applicationManagement: SidebarItem[] = [
  { label: "Form Builder", href: "/dashboard/service-forms", icon: ClipboardList, permission: "service_forms.read" },
  { label: "Form Sections", href: "/dashboard/service-form-sections", icon: Settings, permission: "service_forms.read" },
  { label: "Application Summary", href: "/dashboard/applications/summary", icon: LayoutDashboard, permission: "applications.summary" },
  { label: "Service Applications", href: "/dashboard/service-applications", icon: FileText, permission: "service_applications.read" },
];

const officerApplications: SidebarItem[] = [
  { label: "Officer Queue", href: "/dashboard/officer/applications", icon: UserCheck, permission: "service_applications.review" },
];

const auditItems: SidebarItem[] = [
  { label: "Audit Logs", href: "/dashboard/audit-logs", icon: FileText, permission: "audit_logs.read" },
];

const customerItems: SidebarItem[] = [
  { label: "My Applications", href: "/my-applications", icon: FileText, permission: "applications.own" },
  { label: "Track Application", href: "/track-application", icon: ClipboardList, permission: "applications.track" },
];

const adminSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Users & Roles", userManagement),
  s("Locations", locationManagement),
  s("Services", serviceManagement),
  s("Applications", [...applicationManagement, ...officerApplications]),
  s("Audit", auditItems),
];

const managerSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Users & Roles", userManagement),
  s("Services", serviceManagement),
  s("Applications", [...applicationManagement, ...officerApplications]),
  s("Audit", auditItems),
];

const officerSections = (role: AppRoleKey): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Applications", officerApplications),
];

export const sidebarConfig: Record<AppRoleKey, RoleSidebar> = {
  "super-admin": {
    title: "Super Admin",
    icon: ShieldCheck,
    sections: adminSections("super-admin"),
  },
  manager: {
    title: "Manager",
    icon: ShieldCheck,
    sections: managerSections("manager"),
  },
  admin: {
    title: "Admin",
    icon: ShieldCheck,
    sections: adminSections("admin"),
  },
  "front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: officerSections("front-officer"),
  },
  "back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: officerSections("back-officer"),
  },
  customer: {
    title: "Customer",
    icon: UserCheck,
    sections: [
      s("Main", [dashboardItem("customer")]),
      s("Applications", customerItems),
    ],
  },
};

export function getSidebarForRole(role?: string | null): RoleSidebar {
  return sidebarConfig[normalizeRole(role)];
}

function itemAllowed(item: SidebarItem, permissions: string[]) {
  return !item.permission || permissions.includes(item.permission);
}

export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []) {
  return roleSidebar.sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          if (!item.children?.length) {
            return itemAllowed(item, permissions) ? item : null;
          }

          const children = item.children.filter((child) => !child.permission || permissions.includes(child.permission));

          if (!children.length && !itemAllowed(item, permissions)) {
            return null;
          }

          return { ...item, children };
        })
        .filter(Boolean) as SidebarItem[];

      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
}
