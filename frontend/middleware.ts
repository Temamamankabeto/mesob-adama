import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // ✅ SAFE ROLE (avoid crash + normalize)
  const roleRaw = request.cookies.get("role")?.value;
  const role = roleRaw ? roleRaw.toLowerCase().trim() : null;

  const pathname = request.nextUrl.pathname;

  /**
   * =========================
   * PUBLIC ROUTES
   * =========================
   */
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/about",
    "/service-provider",
    "/service-providers",
    "/resources",
    "/resources/reports",
    "/services",
    "/training/application-workflow",
  ];

  const isServiceDetail = /^\/services\/\d+$/.test(pathname);
  const isApplyPage = /^\/services\/\d+\/apply$/.test(pathname);

  const isTrainingAsset = pathname.startsWith("/presentations/application-workflow/");
  const isTrainingPage = pathname.startsWith("/training/application-workflow");

  const isPublicRoute =
    publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    isServiceDetail ||
    isTrainingAsset ||
    isTrainingPage;

  /**
   * =========================
   * 1. NOT LOGGED IN (BLOCK PRIVATE ROUTES)
   * =========================
   */
  if (!token && !isPublicRoute) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  /**
   * =========================
   * 2. APPLY PAGE (ONLY CUSTOMER ALLOWED)
   * =========================
   */
  if (isApplyPage) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // ✅ FIXED LOGIC
    if (role !== "customer") {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }
  }

  /**
   * =========================
   * 3. BLOCK LOGIN IF LOGGED IN
   * =========================
   */
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * Apply middleware only where needed
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};