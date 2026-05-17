import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // 🔥 SAFE ROLE READ (fix undefined crash + normalize)
  const role = request.cookies
    .get("role")
    ?.value
    ?.toLowerCase()
    ?.trim();

  const pathname = request.nextUrl.pathname;

  /**
   * =========================
   * PUBLIC ROUTES
   * =========================
   */
  const publicRoutes = ["/", "/login", "/register", "/about", "/services"];

  const isServiceList = pathname === "/services";
  const isServiceDetail = /^\/services\/\d+$/.test(pathname);
  const isApplyPage = /^\/services\/\d+\/apply$/.test(pathname);

  const isPublicRoute =
    publicRoutes.includes(pathname) || isServiceDetail;

  /**
   * =========================
   * 1. NOT LOGGED IN
   * =========================
   */
  if (!token && !isPublicRoute) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  /**
   * =========================
   * 2. APPLY PAGE PROTECTION
   * ONLY CUSTOMER CAN APPLY
   * =========================
   */
  if (isApplyPage) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 🔥 IMPORTANT FIX: fallback safe check
    if (!role || role !== "customer") {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }
  }

  /**
   * =========================
   * 3. BLOCK LOGIN/REGISTER IF LOGGED IN
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