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

export function getBucketName(): string {
  return process.env.S3_BUCKET ?? "eepistore";
}

/**
 * Verify S3/MinIO connectivity at startup.
 * Throws if the bucket is unreachable.
 */
export async function verifyS3Connection(): Promise<void> {
  const s3 = getS3Client();
  const bucket = getBucketName();
  await s3.send(new HeadBucketCommand({ Bucket: bucket }));
}
