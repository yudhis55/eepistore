import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

function createS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    ...(endpoint
      ? {
          endpoint,
          forcePathStyle,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "minioadmin",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "minioadmin",
          },
        }
      : {}),
  });
}

let client: S3Client | undefined;

export function getS3Client(): S3Client {
  if (!client) {
    client = createS3Client();
  }
  return client;
}

export function getPublicBucketName(): string {
  return process.env.S3_PUBLIC_BUCKET ?? process.env.S3_BUCKET ?? "eepistore-public";
}

export function getPrivateBucketName(): string {
  return process.env.S3_PRIVATE_BUCKET ?? process.env.S3_BUCKET ?? "eepistore-private";
}

/**
 * Verify S3/MinIO connectivity at startup.
 * Throws if the bucket is unreachable.
 */
export async function verifyS3Connection(): Promise<void> {
  const s3 = getS3Client();
  const buckets = new Set([getPublicBucketName(), getPrivateBucketName()]);
  await Promise.all([...buckets].map((Bucket) => s3.send(new HeadBucketCommand({ Bucket }))));
}
