import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { confirmUploadedImage } from "@/lib/storage";

const confirmSchema = z.object({
  key: z.string().min(1).max(1024),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = confirmSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload confirmation" }, { status: 400 });
  }

  try {
    const objectUrl = await confirmUploadedImage(
      parsed.data.key,
      parsed.data.contentType,
      session.user.id,
    );
    return NextResponse.json({ objectUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload confirmation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
