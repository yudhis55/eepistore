import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { filename, contentType, folder, fileSize } = body;

    if (!filename || !contentType || !fileSize) {
      return NextResponse.json(
        { error: "filename, contentType, and fileSize are required" },
        { status: 400 },
      );
    }

    // TODO: replace with actual authenticated user ID from session
    const userId = "dev-user";

    const result = await createPresignedUploadUrl(
      { filename, contentType, folder: folder ?? "products" },
      Number(fileSize),
      userId,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
