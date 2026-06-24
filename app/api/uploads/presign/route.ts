import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/storage";
import { uploadLimiter } from "@/lib/rate-limit";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!uploadLimiter.check(session.user.id)) {
    return NextResponse.json({ error: "Rate limit exceeded. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = await request.json();

    const { filename, contentType, folder, fileSize } = body;

    if (!filename || !contentType || !fileSize) {
      return NextResponse.json(
        { error: "filename, contentType, and fileSize are required" },
        { status: 400 },
      );
    }

    const result = await createPresignedUploadUrl(
      { filename, contentType, folder: folder ?? "products" },
      Number(fileSize),
      session.user.id,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
