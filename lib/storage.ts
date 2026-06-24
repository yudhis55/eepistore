import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getBucketName } from "@/lib/s3";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

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

  const ext = parsed.filename.split(".").pop() ?? "jpg";
  const key = `${parsed.folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: parsed.contentType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 300, // 5 minutes
  });

  const publicUrl = buildPublicUrl(key);

  return { uploadUrl, key, publicUrl };
}

/**
 * Generate a presigned URL for downloading/viewing a private object.
 */
export async function createPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn });
}

/**
 * Delete an object from S3/MinIO.
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
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
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = getBucketName();
  const region = process.env.S3_REGION ?? "us-east-1";

  if (endpoint) {
    // MinIO or S3-compatible: endpoint/bucket/key (path-style)
    const base = endpoint.replace(/\/$/, "");
    return `${base}/${bucket}/${key}`;
  }

  // AWS S3 standard URL
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
