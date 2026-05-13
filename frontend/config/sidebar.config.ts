import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Map,
  FileText,
  UserCheck,
  Settings,
  Briefcase,
  Workflow,
  Layers3,
  ScrollText,
  Building2,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  dashboardConfig,
  normalizeRole,
  type AppRoleKey,
} from "@/config/dashboard.config";

/* =========================================================
 TYPES
========================================================= */

export type SidebarChildItem = {
  label: string;
  href: string;
  permission?: string;
};

export type SidebarItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
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

/* =========================================================
 HELPERS
========================================================= */

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

/* =========================================================
 SIDEBAR CONFIG
========================================================= */

export const sidebarConfig: Record<
  AppRoleKey,
  RoleSidebar
> = {
  /* =====================================================
   SUPER ADMIN
  ===================================================== */

  "super-admin": {
    title: "Super Admin",
    icon: ShieldCheck,

    sections: [
      /* OVERVIEW */
      s("Overview", [
        dashboardItem("super-admin"),
      ]),

      /* ACCESS MANAGEMENT */
      s("Access Management", [
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
              label: "Roles",
              href: "/dashboard/roles",
              permission: "roles.read",
            },
          ],
        },
      ]),

      /* SERVICE MANAGEMENT */
      s("Service Management", [
        {
          label: "Services",
          icon: Briefcase,

          children: [
            {
              label: "All Services",
              href: "/dashboard/services",
              permission: "permissions.read",
            },

            {
              label: "Windows",
              href: "/dashboard/windows",
              permission: "permissions.read",
            },

            {
              label: "User Services",
              href: "/dashboard/user-services",
              permission: "cities.read",
            },

            {
              label: "Officer Services",
              href: "/dashboard/services/officers",
              permission: "cities.read",
            },
          ],
        },

        {
          label: "Workflow",
          icon: Workflow,

          children: [
            {
              label: "Service Workflow",
              href: "/dashboard/service-window",
              permission: "permissions.read",
            },

            {
              label: "Workflow Management",
              href: "/dashboard/service-window/lists",
              permission: "permissions.read",
            },
          ],
        },
      ]),

      /* FORM BUILDER */
      s("Form Builder", [
        {
          label: "Dynamic Forms",
          icon: FileText,

          children: [
            {
              label: "Form Sections",
              href: "/dashboard/service-form-sections",
              permission: "cities.read",
            },

            {
              label: "Service Forms",
              href: "/dashboard/service-forms",
              permission: "permissions.read",
            },
          ],
        },
      ]),

      /* SYSTEM */
      s("System", [
        {
          label: "Audit Logs",
          href: "/dashboard/audit-logs",
          icon: ScrollText,
          permission: "audit_logs.read",
        },
      ]),
    ],
  },

  /* =====================================================
   SUBCITY ADMIN
  ===================================================== */

  "subcity-admin": {
    title: "Subcity Admin",
    icon: Building2,

    sections: [
      s("Overview", [
        dashboardItem("subcity-admin"),
      ]),

      s("Administration", [
        {
          label: "Management",
          icon: Users,

          children: [
            {
              label: "Users",
              href: "/dashboard/users",
              permission: "users.read",
            },

            {
              label: "Locations",
              href: "/dashboard/locations",
              permission: "subcities.read",
            },
          ],
        },
      ]),
    ],
  },

  /* =====================================================
   WOREDA ADMIN
  ===================================================== */

  "woreda-admin": {
    title: "Woreda Admin",
    icon: Building2,

    sections: [
      s("Overview", [
        dashboardItem("woreda-admin"),
      ]),

      s("Administration", [
        {
          label: "Management",
          icon: Users,

          children: [
            {
              label: "Users",
              href: "/dashboard/users",
              permission: "users.read",
            },

            {
              label: "Locations",
              href: "/dashboard/locations",
              permission: "woredas.read",
            },
          ],
        },
      ]),
    ],
  },

  /* =====================================================
   FRONT OFFICERS
  ===================================================== */

  "city-front-officer": {
    title: "Front Officer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("city-front-officer"),
      ]),
    ],
  },

  "city-back-officer": {
    title: "Back Officer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("city-back-officer"),
      ]),
    ],
  },

  "subcity-front-officer": {
    title: "Front Officer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("subcity-front-officer"),
      ]),
    ],
  },

  "subcity-back-officer": {
    title: "Back Officer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("subcity-back-officer"),
      ]),
    ],
  },

  "woreda-front-officer": {
    title: "Front Officer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("woreda-front-officer"),
      ]),
    ],
  },

  "woreda-back-officer": {
    title: "Back Officer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("woreda-back-officer"),
      ]),
    ],
  },

  /* =====================================================
   CUSTOMER
  ===================================================== */

  customer: {
    title: "Customer",
    icon: UserCheck,

    sections: [
      s("Overview", [
        dashboardItem("customer"),
      ]),
    ],
  },
};

/* =========================================================
 GET SIDEBAR
========================================================= */

export function getSidebarForRole(
  role?: string | null
): RoleSidebar {
  return sidebarConfig[
    normalizeRole(role)
  ];
}

/* =========================================================
 FILTER PERMISSIONS
========================================================= */

export function filterSidebarByPermissions(
  roleSidebar: RoleSidebar,
  permissions: string[] = []
): SidebarSection[] {
  return roleSidebar.sections
    .map((section) => ({
      ...section,

      items: section.items
        .map((item) => {
          /* CHILDREN FILTER */
          if (item.children?.length) {
            const filteredChildren =
              item.children.filter(
                (child) =>
                  !child.permission ||
                  permissions.includes(
                    child.permission
                  )
              );

            return {
              ...item,
              children: filteredChildren,
            };
          }

          return item;
        })

        /* REMOVE EMPTY */
        .filter((item) => {
          if (item.children) {
            return item.children.length > 0;
          }

          return (
            !item.permission ||
            permissions.includes(
              item.permission
            )
          );
        }),
    }))

    /* REMOVE EMPTY SECTIONS */
    .filter(
      (section) =>
        section.items.length > 0
    );
}