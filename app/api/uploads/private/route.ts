import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPresignedDownloadUrl } from "@/lib/storage";
import type { Role } from "@/lib/rbac";
import {
  canReadPrivateObject,
  objectUrlMatchesKey,
  parsePrivateObjectKey,
} from "@/lib/private-object-access";
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
          where: {
            OR: [
              { proofImageUrl: { contains: encodeURIComponent(objectKey) } },
              { proofImageUrl: { contains: objectKey } },
            ],
          },
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
        const notifications = await prisma.notification.findMany({
          where: {
            userId: ownerId,
            type: "VERIFICATION_SUBMITTED",
          },
          select: {
            payload: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const match = notifications.find((notification) => {
          const payload = notification.payload as { ktmImageUrl?: string } | null;
          return objectUrlMatchesKey(payload?.ktmImageUrl, objectKey);
        });

        return match ? { userId: ownerId } : null;
      },
    },
  );

  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signedUrl = await createPresignedDownloadUrl(key, 300);
  return NextResponse.redirect(signedUrl);
}
