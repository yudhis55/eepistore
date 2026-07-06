import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/register", "/reset-password", "/products"];
const publicApiRoutes = ["/api/auth", "/api/health", "/api/readiness"];

export async function proxy(request: NextRequest) {
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
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC: seller-only routes
  if (pathname.startsWith("/dashboard") && token.role !== "SELLER" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // RBAC: admin-only routes
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
