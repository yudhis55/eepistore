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

  if (!session?.user || session.user.suspended) {
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
