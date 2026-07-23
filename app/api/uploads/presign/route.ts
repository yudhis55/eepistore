import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/storage";
import { uploadLimiter } from "@/lib/rate-limit";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PUBLIC_MEDIA_FOLDERS = new Set(["products"]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await uploadLimiter.check(session.user.id))) {
    return NextResponse.json({ error: "Rate limit exceeded. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = await request.json();

    const { filename, contentType, folder = "products", fileSize } = body;

    if (!filename || !contentType || !fileSize) {
      return NextResponse.json(
        { error: "filename, contentType, and fileSize are required" },
        { status: 400 },
      );
    }

    if (!(await canUploadToFolder(session.user.id, session.user.role, folder))) {
      return NextResponse.json({ error: "Forbidden upload folder" }, { status: 403 });
    }

    const result = await createPresignedUploadUrl(
      { filename, contentType, folder },
      Number(fileSize),
      session.user.id,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate upload URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function canUploadToFolder(userId: string, role: string, folder: unknown): Promise<boolean> {
  if (folder === "avatars" || folder === "payments" || folder === "verifications") {
    return true;
  }
  if (!PUBLIC_MEDIA_FOLDERS.has(String(folder)) || (role !== "SELLER" && role !== "ADMIN")) {
    return false;
  }
  if (role === "ADMIN") return true;

  const store = await prisma.storeProfile.findUnique({
    where: { userId },
    select: { status: true },
  });
  return store?.status === "APPROVED";
}
