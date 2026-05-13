import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeRoleName } from "@/config/roles.config";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/services",
  "/track-application",
];

const MANAGEMENT_ROLES = ["super_admin", "manager", "admin"];
const OFFICER_ROLES = ["front_officer", "back_officer"];

const ROUTE_ROLE_RULES: Array<{ prefixes: string[]; roles: string[] }> = [
  {
    prefixes: ["/dashboard/users", "/dashboard/roles", "/dashboard/audit-logs"],
    roles: MANAGEMENT_ROLES,
  },
  {
    prefixes: [
      "/dashboard/service-forms",
      "/dashboard/service-form-sections",
      "/dashboard/service-applications",
      "/dashboard/applications/summary",
    ],
    roles: MANAGEMENT_ROLES,
  },
  {
    prefixes: ["/dashboard/officer/applications"],
    roles: [...MANAGEMENT_ROLES, ...OFFICER_ROLES],
  },
  {
    prefixes: ["/my-applications"],
    roles: ["customer"],
  },
];

function parseRoles(raw?: string) {
  if (!raw) return [];

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);

    if (Array.isArray(parsed)) return parsed.map((role) => normalizeRoleName(String(role)));
    if (typeof parsed === "string") return [normalizeRoleName(parsed)];
  } catch {
    // fallback below
  }

  return raw
    .split(",")
    .map((role) => normalizeRoleName(role.trim()))
    .filter(Boolean);
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const matchedRule = ROUTE_ROLE_RULES.find((rule) =>
    rule.prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );

  if (!matchedRule) {
    return NextResponse.next();
  }

  const rolesCookie =
    request.cookies.get("roles")?.value ||
    request.cookies.get("role")?.value;

  const userRoles = parseRoles(rolesCookie);

  if (userRoles.length === 0) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!matchedRule.roles.some((role) => userRoles.includes(normalizeRoleName(role)))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/users/:path*",
    "/dashboard/roles/:path*",
    "/dashboard/audit-logs/:path*",
    "/dashboard/service-forms/:path*",
    "/dashboard/service-form-sections/:path*",
    "/dashboard/service-applications/:path*",
    "/dashboard/applications/summary/:path*",
    "/dashboard/officer/applications/:path*",
    "/my-applications/:path*",
  ],
};
