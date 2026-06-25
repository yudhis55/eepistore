/**
 * Set the MinIO/S3 bucket CORS policy so the browser can PUT uploads directly
 * (presigned-URL flow) from the dev origin. MinIO standalone doesn't implement
 * PutBucketCors via `mc cors`, so we use the AWS SDK directly.
 *
 * Run once after `dev:up`:  npm run storage:setup
 * Idempotent — safe to re-run.
 */
import "dotenv/config";
import { S3Client, PutBucketCorsCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { setTimeout as sleep } from "node:timers/promises";

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET ?? "eepistore";
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

// Dev origins that upload from the browser. Add prod origins here when shipping.
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

// On Windows + WSL, Node resolves `localhost` to IPv6 [::1] which is intercepted
// by wslrelay and resets the connection. The browser (which PUTs to the presigned
// URL from S3_ENDPOINT) handles `localhost` fine, but this host-side script must
// use 127.0.0.1 to reach the MinIO container directly. Override only the local
// host portion; leave prod endpoints untouched.
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

/** Wait for the bucket to exist (MinIO may still be starting after `up -d`). */
async function waitForBucket(retries = 30): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      return;
    } catch {
      if (i === retries)
        throw new Error(
          `Bucket '${bucket}' not reachable after ${retries} attempts. Is 'docker compose up' running?`,
        );
      await sleep(1000);
    }
  }
}

async function main() {
  await waitForBucket();
  console.log(`✓ Bucket '${bucket}' reachable`);

  // Set bucket CORS. MinIO modern removed the PutBucketCors bucket API
  // ("functionality that is not implemented") and handles CORS at the server
  // level via the MINIO_API_CORS_ALLOW_ORIGIN env var (see docker-compose).
  // On real AWS S3 this API call succeeds. Treat "not implemented" as success.
  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: allowedOrigins,
              AllowedMethods: ["GET", "PUT", "POST", "HEAD"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      }),
    );
    console.log(`✓ CORS set on '${bucket}' for origins: ${allowedOrigins.join(", ")}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/not implemented/i.test(msg)) {
      console.log(
        `✓ CORS handled via MINIO_API_CORS_ALLOW_ORIGIN (MinIO server-level) for: ${allowedOrigins.join(", ")}`,
      );
    } else {
      throw e;
    }
  }
}

main().catch((e) => {
  console.error("Setup failed:", e.message);
  process.exit(1);
});
