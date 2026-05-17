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
  Logs,
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

const s = (
  title: string,
  items: SidebarItem[]
): SidebarSection => ({
  title,
  items,
});

const dashboardItem = (
  role: AppRoleKey
): SidebarItem => ({
  label: "Dashboard",
  href: dashboardConfig[role].route,
  icon: LayoutDashboard,
});

/*
|--------------------------------------------------------------------------
| SUBMENUS
|--------------------------------------------------------------------------
*/

const userManagementMenu: SidebarItem = {
  label: "User Management",
  icon: Users,
  children: [
    {
      label: "Users",
      href: "/dashboard/users",
      permission: "users.read",
    },
    {
      label: "Roles",
      href: "/dashboard/roles",
      permission: "roles.read",
    },
    {
      label: "Permissions",
      href: "/dashboard/permissions",
      permission: "permissions.read",
    },
  ],
};

const locationManagementMenu: SidebarItem = {
  label: "Location Management",
  icon: Map,
  children: [
    {
      label: "Locations",
      href: "/dashboard/locations",
      permission: "cities.read",
    },
    {
      label: "Cities",
      href: "/dashboard/locations/cities",
      permission: "cities.read",
    },
    {
      label: "Subcities",
      href: "/dashboard/locations/subcities",
      permission: "subcities.read",
    },
    {
      label: "Woredas",
      href: "/dashboard/locations/woredas",
      permission: "woredas.read",
    },
  ],
};

const serviceManagementMenu: SidebarItem = {
  label: "Service Management",
  icon: Building2,
  children: [
    {
      label: "Services",
      href: "/dashboard/services",
      permission: "services.read",
    },
    {
      label: "User Services",
      href: "/dashboard/user-services",
      permission: "services.read",
    },
    {
      label: "Officer Services",
      href: "/dashboard/services/officers",
      permission: "services.read",
    },
  ],
};

const windowManagementMenu: SidebarItem = {
  label: "Window Management",
  icon: Workflow,
  children: [
    {
      label: "Windows",
      href: "/dashboard/windows",
      permission: "windows.read",
    },
    {
      label: "Service Windows",
      href: "/dashboard/service-window",
      permission: "windows.read",
    },
    {
      label: "Window Assignment",
      href: "/dashboard/service-window/lists",
      permission: "windows.read",
    },
  ],
};

const formBuilderMenu: SidebarItem = {
  label: "Form Builder",
  icon: ClipboardList,
  children: [
    {
      label: "Service Forms",
      href: "/dashboard/service-forms",
      permission: "service_forms.read",
    },
    {
      label: "Form Sections",
      href: "/dashboard/service-form-sections",
      permission: "service_forms.read",
    },
    {
      label: "Form Steps",
      href: "/dashboard/service-form-steps",
      permission: "service_forms.read",
    },
    {
      label: "Form Fields",
      href: "/dashboard/service-form-fields",
      permission: "service_forms.read",
    },
    {
      label: "Field Conditions",
      href: "/dashboard/service-form-field-conditions",
      permission: "service_forms.read",
    },
  ],
};

const applicationManagementMenu: SidebarItem = {
  label: "Applications",
  icon: FileText,
  children: [
    {
      label: "Application Summary",
      href: "/dashboard/applications/summary",
      permission: "applications.summary",
    },
    {
      label: "Service Applications",
      href: "/dashboard/service-applications",
      permission: "service_applications.read",
    },
    {
      label: "Officer Queue",
      href: "/dashboard/officer/applications",
      permission: "service_applications.review",
    },
  ],
};

const officerApplicationMenu: SidebarItem = {
  label: "Officer Applications",
  icon: ClipboardCheck,
  children: [
    {
      label: "Application Queue",
      href: "/dashboard/officer/applications",
      permission: "service_applications.review",
    },
  ],
};

const customerApplicationMenu: SidebarItem = {
  label: "My Applications",
  icon: FileText,
  children: [
    {
      label: "Application List",
      href: "/dashboard/my-applications",
      permission: "applications.own",
    },
    {
      label: "Track Application",
      href: "/dashboard/track-application",
      permission: "applications.track",
    },
  ],
};

const systemMenu: SidebarItem = {
  label: "System",
  icon: Settings,
  children: [
    {
      label: "Audit Logs",
      href: "/dashboard/audit-logs",
      permission: "audit_logs.read",
    },
  ],
};

/*
|--------------------------------------------------------------------------
| ROLE SECTIONS
|--------------------------------------------------------------------------
*/

const adminSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Management", [
    userManagementMenu,
    locationManagementMenu,
    serviceManagementMenu,
    windowManagementMenu,
  ]),
  s("Applications", [
    formBuilderMenu,
    applicationManagementMenu,
  ]),
  s("System", [systemMenu]),
];

const managerSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Management", [
    userManagementMenu,
    serviceManagementMenu,
    windowManagementMenu,
  ]),
  s("Applications", [
    formBuilderMenu,
    applicationManagementMenu,
  ]),
  s("System", [systemMenu]),
];

const officerSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Applications", [officerApplicationMenu]),
];

const customerSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("Main", [dashboardItem(role)]),
  s("Applications", [customerApplicationMenu]),
];

/*
|--------------------------------------------------------------------------
| SIDEBAR CONFIG
|--------------------------------------------------------------------------
*/

export const sidebarConfig: Record<
  AppRoleKey,
  RoleSidebar
> = {
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
    sections: customerSections("customer"),
  },
};

export function getSidebarForRole(
  role?: string | null
): RoleSidebar {
  return sidebarConfig[normalizeRole(role)];
}

function childAllowed(
  child: SidebarChildItem,
  permissions: string[]
): boolean {
  return (
    !child.permission ||
    permissions.includes(child.permission)
  );
}

function itemAllowed(
  item: SidebarItem,
  permissions: string[]
): boolean {
  return (
    !item.permission ||
    permissions.includes(item.permission)
  );
}

export function filterSidebarByPermissions(
  roleSidebar: RoleSidebar,
  permissions: string[] = []
): SidebarSection[] {
  return roleSidebar.sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          if (!item.children?.length) {
            return itemAllowed(item, permissions)
              ? item
              : null;
          }

          const children = item.children.filter(
            (child) =>
              childAllowed(child, permissions)
          );

          if (
            children.length === 0 &&
            !itemAllowed(item, permissions)
          ) {
            return null;
          }

          return {
            ...item,
            children,
          };
        })
        .filter(Boolean) as SidebarItem[];

      return {
        ...section,
        items,
      };
    })
    .filter(
      (section) => section.items.length > 0
    );
}
