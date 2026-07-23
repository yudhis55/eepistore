import { auth } from "@/auth";

export type Role = "BUYER" | "SELLER" | "ADMIN";

/**
 * Get the current authenticated session or throw.
 * Use in Server Components and Route Handlers.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user || session.user.suspended) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require a specific role. Throws if the user doesn't have it.
 */
export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    throw new Error("Forbidden");
  }
  return session;
}

/**
 * Check if the current user has a specific role.
 * Returns null if not authenticated.
 */
export async function hasRole(role: Role): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return session.user.role === role;
}
