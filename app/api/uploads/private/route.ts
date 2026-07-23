import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPresignedDownloadUrl } from "@/lib/storage";
import type { Role } from "@/lib/rbac";
import { canReadPrivateObject, parsePrivateObjectKey } from "@/lib/private-object-access";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = request.nextUrl.searchParams.get("key") ?? "";
  const object = parsePrivateObjectKey(key);

  if (!object) {
    return NextResponse.json({ error: "Invalid object key" }, { status: 400 });
  }

  const canRead = await canReadPrivateObject(
    { id: session.user.id, role: session.user.role as Role },
    object,
    {
      findPaymentAccessByKey: async (objectKey) => {
        const payment = await prisma.payment.findFirst({
          where: { proofObjectKey: objectKey },
          select: {
            order: {
              select: {
                buyerId: true,
                store: { select: { userId: true } },
              },
            },
          },
        });

        return payment
          ? {
              buyerId: payment.order.buyerId,
              sellerUserId: payment.order.store.userId,
            }
          : null;
      },
      findVerificationAccessByKey: async (objectKey, ownerId) => {
        const user = await prisma.user.findFirst({
          where: {
            id: ownerId,
            verificationObjectKey: objectKey,
          },
          select: {
            id: true,
          },
        });

        return user ? { userId: user.id } : null;
      },
    },
  );

  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signedUrl = await createPresignedDownloadUrl(key, 300);
  return NextResponse.redirect(signedUrl);
}
