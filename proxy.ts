import { NextResponse } from "next/server";
import { auth } from "@/auth";

const publicRoutes = ["/", "/login", "/register", "/reset-password", "/products"];
const publicApiRoutes = ["/api/auth", "/api/health", "/api/readiness"];

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public pages
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const session = request.auth;

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.suspended) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC: seller-only routes
  if (
    pathname.startsWith("/dashboard") &&
    session.user.role !== "SELLER" &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // RBAC: admin-only routes
  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
