import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { UserManagement } from "@/components/user-management";
import { PageHeader } from "@/components/ui/page-header";
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
    <>
      <PageHeader
        title="Kelola User"
        description={`Kelola akun pengguna dan status verifikasi · ${users.length} user`}
      />
      <UserManagement users={users} />
    </>
  );
}
