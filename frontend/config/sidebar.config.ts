import { LayoutDashboard, Users, ShieldCheck, Map, FileText, UserCheck, Home, Settings } from "lucide-react";
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

export const sidebarConfig: Record<AppRoleKey, RoleSidebar> = {
  "super-admin": {
    title: "Super Admin",
    icon: ShieldCheck,
    sections: [
      s("Main", [dashboardItem("super-admin")]),
      s("Management", [
        { label: "Users", href: "/dashboard/users", icon: Users, permission: "users.read" },
        { label: "Roles", href: "/dashboard/roles", icon: Users, permission: "roles.read" },
        // { label: "Permissions", href: "/dashboard/permissions", icon: ShieldCheck, permission: "permissions.read" },
        { label: "Services", href: "/dashboard/services", icon: LayoutDashboard, permission: "permissions.read" },
        { label: "Service Windows", href: "/dashboard/service-window", icon: LayoutDashboard, permission: "permissions.read" },
        // window service management
        { label: "Service Window Management", href: "/dashboard/service-window/lists", icon: LayoutDashboard, permission: "permissions.read" },

        { label: "Window", href: "/dashboard/windows", icon: LayoutDashboard, permission: "permissions.read" },
        { label: "User Services", href: "/dashboard/user-services", icon: Settings, permission: "cities.read" },
        { label: "Officers Services", href: "/dashboard/services/officers", icon: Settings, permission: "cities.read" },
  // fomr builders
  { label: "Service Form", href: "/dashboard/service-forms", icon: Settings, permission: "permissions.read" },
        { label: "Audit Logs", href: "/dashboard/audit-logs", icon: FileText, permission: "audit_logs.read" },
      ]),
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
    ],
  },

  "city-front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("city-front-officer")])],
  },

  "city-back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("city-back-officer")])],
  },

  "subcity-front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("subcity-front-officer")])],
  },

  "subcity-back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("subcity-back-officer")])],
  },

  "woreda-front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("woreda-front-officer")])],
  },

  "woreda-back-officer": {
    title: "Back Officer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("woreda-back-officer")])],
  },

  customer: {
    title: "Customer",
    icon: UserCheck,
    sections: [s("Main", [dashboardItem("customer")])],
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
