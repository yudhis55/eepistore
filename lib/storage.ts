import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { getPrivateBucketName, getPublicBucketName, getS3Client } from "@/lib/s3";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const privateFolders = new Set(["payments", "verifications"]);

const uploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[\w\-. ]+$/, "Filename contains invalid characters"),
  contentType: z.enum(allowedMimeTypes),
  folder: z.enum(["products", "avatars", "payments", "verifications"]).default("products"),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

/**
 * Generate a presigned URL for direct browser upload to S3/MinIO.
 * Validates file type and size before issuing the URL.
 */
export async function createPresignedUploadUrl(
  request: UploadRequest,
  fileSize: number,
  userId: string,
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const parsed = uploadRequestSchema.parse(request);

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const ext = parsed.filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${parsed.folder}/${userId}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketForFolder(parsed.folder),
    Key: key,
    ContentType: parsed.contentType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 300, // 5 minutes
  });

  const publicUrl = isPrivateFolder(parsed.folder)
    ? buildPrivateAccessUrl(key)
    : buildPublicUrl(key);

  return { uploadUrl, key, publicUrl };
}

/**
 * Generate a presigned URL for downloading/viewing a private object.
 */
export async function createPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getPrivateBucketName(),
    Key: key,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn });
}

/**
 * Delete an object from S3/MinIO.
 */
export async function deleteObject(key: string): Promise<void> {
  const folder = uploadRequestSchema.shape.folder.parse(key.split("/")[0]);
  const command = new DeleteObjectCommand({
    Bucket: bucketForFolder(folder),
    Key: key,
  });

  await getS3Client().send(command);
}

/**
 * Build a public-accessible URL for an object.
 * In dev (MinIO), this is the MinIO endpoint + bucket + key.
 * In prod (S3), this is the standard S3 URL pattern.
 */
export function buildPublicUrl(key: string): string {
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = getPublicBucketName();
  const region = process.env.S3_REGION ?? "us-east-1";

  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  if (endpoint) {
    // MinIO or S3-compatible: endpoint/bucket/key (path-style)
    const base = endpoint.replace(/\/$/, "");
    return `${base}/${bucket}/${key}`;
  }

  // AWS S3 standard URL
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function isOwnedPublicMediaUrl(url: string, folder: "products" | "avatars", userId: string) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    return path
      .split("/")
      .filter(Boolean)
      .some((segment, index, parts) => {
        return segment === folder && parts[index + 1] === userId && parts.length === index + 3;
      });
  } catch {
    return false;
  }
}

function isPrivateFolder(folder: UploadRequest["folder"]): boolean {
  return privateFolders.has(folder);
}

function bucketForFolder(folder: UploadRequest["folder"]): string {
  return isPrivateFolder(folder) ? getPrivateBucketName() : getPublicBucketName();
}

export async function confirmUploadedImage(
  key: string,
  expectedContentType: UploadRequest["contentType"],
  userId: string,
): Promise<string> {
  const parts = key.split("/");
  const folder = uploadRequestSchema.shape.folder.parse(parts[0]);

  if (parts.length !== 3 || parts[1] !== userId || key.includes("..") || key.includes("\\")) {
    throw new Error("Invalid upload key");
  }

  const Bucket = bucketForFolder(folder);
  const s3 = getS3Client();

  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    if (!head.ContentLength || head.ContentLength > MAX_FILE_SIZE) {
      throw new Error("Invalid uploaded file size");
    }

    const object = await s3.send(
      new GetObjectCommand({
        Bucket,
        Key: key,
        Range: "bytes=0-15",
      }),
    );
    const bytes = await object.Body?.transformToByteArray();
    if (!bytes || detectImageMime(bytes) !== expectedContentType) {
      throw new Error("Uploaded file content does not match its declared image type");
    }
  } catch (error) {
    await s3.send(new DeleteObjectCommand({ Bucket, Key: key })).catch(() => undefined);
    throw error;
  }

  return isPrivateFolder(folder) ? buildPrivateAccessUrl(key) : buildPublicUrl(key);
}

function detectImageMime(bytes: Uint8Array): UploadRequest["contentType"] | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function buildPrivateAccessUrl(key: string): string {
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = new URL("/api/uploads/private", baseUrl);
  url.searchParams.set("key", key);
  return url.toString();
}
