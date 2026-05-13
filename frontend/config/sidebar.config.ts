import {
  ClipboardList,
  FileText,
  Home,
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

const applicationItems: SidebarItem[] = [
  {
    label: "Form Builder",
    href: "/dashboard/service-forms",
    icon: ClipboardList,
    permission: "permissions.read",
  },
  {
    label: "Application Summary",
    href: "/dashboard/applications/summary",
    icon: LayoutDashboard,
    permission: "permissions.read",
  },
  {
    label: "Service Applications",
    href: "/dashboard/service-applications",
    icon: FileText,
    permission: "permissions.read",
  },
  {
    label: "Officer Queue",
    href: "/dashboard/officer/applications",
    icon: UserCheck,
  },
];

export const sidebarConfig: Record<AppRoleKey, RoleSidebar> = {
  "super-admin": {
    title: "Super Admin",
    icon: ShieldCheck,
    sections: [
      s("Main", [dashboardItem("super-admin")]),
      s("Management", [
        { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
        { label: "Roles", href: "/dashboard/roles", icon: Users, permission: "roles.read" },
        { label: "Services", href: "/dashboard/services", icon: LayoutDashboard, permission: "permissions.read" },
        { label: "Service Windows", href: "/dashboard/service-window", icon: LayoutDashboard, permission: "permissions.read" },
        { label: "Service Window Management", href: "/dashboard/service-window/lists", icon: LayoutDashboard, permission: "permissions.read" },
        { label: "Window", href: "/dashboard/windows", icon: LayoutDashboard, permission: "permissions.read" },
        { label: "User Services", href: "/dashboard/user-services", icon: Settings, permission: "cities.read" },
        { label: "Officers Services", href: "/dashboard/services/officers", icon: Settings, permission: "cities.read" },
        { label: "Form Sections", href: "/dashboard/service-form-sections", icon: Settings, permission: "cities.read" },
        { label: "Audit Logs", href: "/dashboard/audit-logs", icon: FileText, permission: "audit_logs.read" },
      ]),
      s("Applications", applicationItems),
    ],
  },

  "subcity-admin": {
    title: "Subcity Admin",
    icon: ShieldCheck,
    sections: [
      s("Main", [dashboardItem("subcity-admin")]),
      s("Management", [
        { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
        { label: "Locations", href: "/dashboard/locations", icon: Map, permission: "subcities.read" },
      ]),
      s("Applications", applicationItems),
    ],
  },

  "woreda-admin": {
    title: "Woreda Admin",
    icon: ShieldCheck,
    sections: [
      s("Main", [dashboardItem("woreda-admin")]),
      s("Management", [
        { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
        { label: "Locations", href: "/dashboard/locations", icon: Map, permission: "woredas.read" },
      ]),
      s("Applications", applicationItems),
    ],
  },

  "city-front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("city-front-officer")]), s("Applications", [applicationItems[3]])],
  },

  "city-back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("city-back-officer")]), s("Applications", [applicationItems[3]])],
  },

  "subcity-front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("subcity-front-officer")]), s("Applications", [applicationItems[3]])],
  },

  "subcity-back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("subcity-back-officer")]), s("Applications", [applicationItems[3]])],
  },

  "woreda-front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("woreda-front-officer")]), s("Applications", [applicationItems[3]])],
  },

  "woreda-back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("woreda-back-officer")]), s("Applications", [applicationItems[3]])],
  },

  customer: {
    title: "Customer",
    icon: UserCheck,
    sections: [
      s("Main", [dashboardItem("customer")]),
      s("Applications", [
        { label: "My Applications", href: "/my-applications", icon: FileText },
        { label: "Track Application", href: "/track-application", icon: ClipboardList },
      ]),
    ],
  },
};

export function getSidebarForRole(role?: string | null): RoleSidebar {
  return sidebarConfig[normalizeRole(role)];
}

export function filterSidebarByPermissions(roleSidebar: RoleSidebar, permissions: string[] = []) {
  return roleSidebar.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || permissions.includes(item.permission)),
    }))
    .filter((section) => section.items.length > 0);
}
