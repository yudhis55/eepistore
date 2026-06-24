import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { UserManagement } from "@/components/user-management";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola User — Admin",
};

export default async function AdminUsersPage() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerifiedStudent: true,
      nim: true,
      suspendedAt: true,
      suspendedReason: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Kelola User ({users.length})</h1>
      <UserManagement users={users} />
    </main>
  );
}
