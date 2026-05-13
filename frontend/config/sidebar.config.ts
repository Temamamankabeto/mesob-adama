import {
  LayoutDashboard,
  Users,
  MapPinned,
  BriefcaseBusiness,
  AppWindow,
  Layers3,
  FolderKanban,
  History,
  ScrollText,
  UserCheck,
  ShieldCheck,
  UserCog,
  Building2,
  MonitorCog,
  FileSearch,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  dashboardConfig,
  normalizeRole,
  type AppRoleKey,
} from "@/config/dashboard.config";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             USER MANAGEMENT                                */
/* -------------------------------------------------------------------------- */

const userManagement: SidebarItem[] = [
  {
    label: "User Management",
    icon: Users,
    children: [
      {
        label: "Users",
        href: "/dashboard/users",
        permission: "users.read",
      },

      {
        label: "Roles & Permissions",
        href: "/dashboard/roles",
        permission: "roles.read",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                           LOCATION MANAGEMENT                              */
/* -------------------------------------------------------------------------- */

const locationManagement: SidebarItem[] = [
  {
    label: "Location Management",
    icon: MapPinned,
    children: [
      {
        label: "Locations",
        href: "/dashboard/locations",
        permission: "cities.read",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                           SERVICE MANAGEMENT                               */
/* -------------------------------------------------------------------------- */

const serviceManagement: SidebarItem[] = [
  {
    label: "Service Management",
    icon: BriefcaseBusiness,
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
  },

  {
    label: "Window Management",
    icon: AppWindow,
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
        label: "Window Assignments",
        href: "/dashboard/service-window/lists",
        permission: "windows.read",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                         APPLICATION MANAGEMENT                             */
/* -------------------------------------------------------------------------- */

const applicationManagement: SidebarItem[] = [
  {
    label: "Form Builder",
    icon: Layers3,
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
    ],
  },

  {
    label: "Applications",
    icon: FolderKanban,
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
  },
];

/* -------------------------------------------------------------------------- */
/*                               AUDIT LOGS                                   */
/* -------------------------------------------------------------------------- */

const auditItems: SidebarItem[] = [
  {
    label: "Audit & Logs",
    icon: History,
    children: [
      {
        label: "Audit Logs",
        href: "/dashboard/audit-logs",
        permission: "audit_logs.read",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                             CUSTOMER ITEMS                                 */
/* -------------------------------------------------------------------------- */

const customerItems: SidebarItem[] = [
  {
    label: "My Applications",
    icon: ScrollText,
    children: [
      {
        label: "Application List",
        href: "/my-applications",
        permission: "applications.own",
      },

      {
        label: "Track Application",
        href: "/track-application",
        permission: "applications.track",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                              ROLE SECTIONS                                 */
/* -------------------------------------------------------------------------- */

const adminSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("MAIN", [dashboardItem(role)]),

  s("MANAGEMENT", [
    ...userManagement,
    ...locationManagement,
    ...serviceManagement,
  ]),

  s("APPLICATIONS", applicationManagement),

  s("SYSTEM", auditItems),
];

const managerSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("MAIN", [dashboardItem(role)]),

  s("MANAGEMENT", [
    ...userManagement,
    ...serviceManagement,
  ]),

  s("APPLICATIONS", applicationManagement),

  s("SYSTEM", auditItems),
];

const officerSections = (
  role: AppRoleKey
): SidebarSection[] => [
  s("MAIN", [dashboardItem(role)]),

  s("APPLICATIONS", [
    {
      label: "Officer Applications",
      icon: UserCheck,
      children: [
        {
          label: "Officer Queue",
          href: "/dashboard/officer/applications",
          permission:
            "service_applications.review",
        },
      ],
    },
  ]),
];

/* -------------------------------------------------------------------------- */
/*                               ROLE CONFIG                                  */
/* -------------------------------------------------------------------------- */

export const sidebarConfig: Record<
  AppRoleKey,
  RoleSidebar
> = {
  "super-admin": {
    title: "Super Admin",
    icon: ShieldCheck,
    sections: adminSections("super-admin"),
  },

  admin: {
    title: "Admin",
    icon: UserCog,
    sections: adminSections("admin"),
  },

  manager: {
    title: "Manager",
    icon: Building2,
    sections: managerSections("manager"),
  },

  "front-officer": {
    title: "Front Officer",
    icon: UserCheck,
    sections: officerSections(
      "front-officer"
    ),
  },

  "back-officer": {
    title: "Back Officer",
    icon: MonitorCog,
    sections: officerSections(
      "back-officer"
    ),
  },

  customer: {
    title: "Customer",
    icon: FileSearch,
    sections: [
      s("MAIN", [
        dashboardItem("customer"),
      ]),

      s("APPLICATIONS", customerItems),
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*                            GET SIDEBAR ROLE                                */
/* -------------------------------------------------------------------------- */

export function getSidebarForRole(
  role?: string | null
): RoleSidebar {
  return sidebarConfig[
    normalizeRole(role)
  ];
}

/* -------------------------------------------------------------------------- */
/*                         FILTER BY PERMISSIONS                              */
/* -------------------------------------------------------------------------- */

function itemAllowed(
  item: SidebarItem,
  permissions: string[]
) {
  return (
    !item.permission ||
    permissions.includes(item.permission)
  );
}

export function filterSidebarByPermissions(
  roleSidebar: RoleSidebar,
  permissions: string[] = []
) {
  return roleSidebar.sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          /* -------------------- SIMPLE MENU -------------------- */

          if (!item.children?.length) {
            return itemAllowed(
              item,
              permissions
            )
              ? item
              : null;
          }

          /* -------------------- SUB MENU ----------------------- */

          const children =
            item.children.filter(
              (child) =>
                !child.permission ||
                permissions.includes(
                  child.permission
                )
            );

          if (
            !children.length &&
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
      (section) =>
        section.items.length > 0
    );
}