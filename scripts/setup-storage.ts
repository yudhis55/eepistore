import "dotenv/config";
import { HeadBucketCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { setTimeout as sleep } from "node:timers/promises";

const endpoint = process.env.S3_ENDPOINT;
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
const buckets = new Set([
  process.env.S3_PUBLIC_BUCKET ?? process.env.S3_BUCKET ?? "eepistore-public",
  process.env.S3_PRIVATE_BUCKET ?? process.env.S3_BUCKET ?? "eepistore-private",
]);
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

const hostEndpoint = endpoint
  ? endpoint
      .replace(/\/\/localhost(:\d+)?/, "//127.0.0.1$1")
      .replace(/\/\/\[::1\](:\d+)?/, "//127.0.0.1$1")
  : undefined;

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  ...(hostEndpoint
    ? {
        endpoint: hostEndpoint,
        forcePathStyle,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "minioadmin",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "minioadmin",
        },
      }
    : {}),
});

async function waitForBucket(bucket: string, retries = 30): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      return;
    } catch {
      if (attempt === retries) {
        throw new Error(`Bucket '${bucket}' not reachable after ${retries} attempts`);
      }
      await sleep(1000);
    }
  }
}

async function configureCors(bucket: string): Promise<void> {
  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: allowedOrigins,
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      }),
    );
    console.log(`CORS set on '${bucket}'`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/not implemented/i.test(message)) throw error;
    console.log(`CORS for '${bucket}' is handled by the MinIO server setting`);
  }
}

async function main() {
  for (const bucket of buckets) {
    await waitForBucket(bucket);
    await configureCors(bucket);
  }
}

main().catch((error) => {
  console.error("Setup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
