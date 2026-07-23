# Deployment Checklist - EEPISTORE

Dokumen ini menjelaskan kontrak deployment aplikasi `eepistore` sebagai
fullstack Next.js container di ECS EC2/ASG. Perbedaan dev dan production harus
berbasis konfigurasi, bukan perubahan kode aplikasi.

## Production Runtime Variables

| Variable                | Local / Dev             | Production                                   |
| ----------------------- | ----------------------- | -------------------------------------------- |
| `NODE_ENV`              | `development`           | `production`                                 |
| `AUTH_SECRET`           | dev secret              | Secrets Manager value                        |
| `AUTH_URL`              | `http://localhost:3000` | `https://eepistore.web.id`                   |
| `DATABASE_URL`          | local PostgreSQL URL    | omit; Terraform provides RDS Proxy variables |
| `RDS_HOST`              | optional                | RDS Proxy endpoint                           |
| `RDS_PORT`              | optional                | `5432`                                       |
| `RDS_DATABASE`          | optional                | app database name                            |
| `RDS_USERNAME`          | optional                | Secrets Manager value                        |
| `RDS_PASSWORD`          | optional                | Secrets Manager value                        |
| `S3_ENDPOINT`           | MinIO endpoint          | omit; use AWS default                        |
| `S3_PUBLIC_BUCKET`      | local public bucket     | Terraform public-media bucket                |
| `S3_PRIVATE_BUCKET`     | local private bucket    | Terraform private-documents bucket           |
| `S3_REGION`             | local/minio region      | `ap-southeast-3`                             |
| `S3_PUBLIC_BASE_URL`    | local MinIO public URL  | `https://media.eepistore.web.id`             |
| `AWS_ACCESS_KEY_ID`     | local MinIO only        | omit; use ECS task role                      |
| `AWS_SECRET_ACCESS_KEY` | local MinIO only        | omit; use ECS task role                      |
| `S3_FORCE_PATH_STYLE`   | `true` for MinIO        | omit                                         |
| `SMTP_HOST`             | local mail server       | configured SMTP provider                     |
| `SMTP_PORT`             | local mail port         | configured SMTP port                         |
| `SMTP_USER`             | optional                | secret if email is enabled                   |
| `SMTP_PASS`             | optional                | secret if email is enabled                   |
| `SMTP_FROM`             | local sender            | configured sender domain                     |

`RDS_HOST` must point to RDS Proxy, not directly to the RDS instance. AWS static
credentials must not be provided in ECS; S3 access must come from the task role.

## Pre-Deployment Steps

1. Ensure ECR repository `eepistore-repo` exists. After a full Terraform
   destroy, infra must create ECR again before this app can publish a new image.
2. Publish the scanned Docker image from GitHub Actions and retain its digest,
   SBOM, and provenance attestation.
3. Pass the resulting immutable digest URI to infra as `TF_VAR_APP_IMAGE_URI`.
4. Run Terraform plan and approve apply only after reviewing the plan artifact.
5. Terraform is the sole owner of the ECS task definition and service.
6. Run database migration as an explicit ECS one-off task after infrastructure
   apply and before accepting runtime evidence.

## Production Checklist

- [ ] HTTPS enabled with ACM and ALB TLS listener.
- [ ] HTTP redirects to HTTPS.
- [ ] WAF attached to ALB.
- [ ] App image uses immutable commit SHA.
- [ ] ECS task runs as non-root and uses read-only root filesystem with `/tmp`
      tmpfs.
- [ ] `/api/health` responds 200 for ALB liveness.
- [ ] `/api/readiness` responds JSON `status=ok` for deployment smoke checks.
- [ ] Database traffic goes through RDS Proxy.
- [ ] Public media is served through CloudFront OAC, not public S3.
- [ ] Private objects remain accessible only through authorized app routes.
- [ ] Logs are shipped to CloudWatch.
- [ ] RDS automated backup is enabled.
- [ ] No static AWS credentials are present in ECS runtime environment.

## Thesis Evidence Flow

1. Capture app quality, SAST, SCA, Docker build, image scan, and image publish
   artifacts.
2. Capture Terraform fmt, validate, TFLint, Trivy, Checkov, plan, apply, and
   post-apply verification artifacts.
3. Capture runtime smoke evidence for HTTPS, redirect, health, readiness, login,
   media upload, and private object authorization.
4. Capture ZAP and k6 artifacts while the stack is live.
5. Capture CloudWatch and AWS resource evidence.
6. Destroy the stack after evidence is safely captured to control AWS cost.

Runtime evidence is orchestrated by the infra repository workflow
`Final Experiment Evidence`. The application repository owns source quality,
security scanning, and immutable image publication; it does not own Terraform,
ECS deployment, or the final runtime experiment.

## Current Evidence Status

- The latest experiment-automation source has passed GitHub quality, security,
  image scanning, SBOM, and provenance gates. Workflow maintenance changes the
  source commit, so publish a fresh digest after that maintenance reaches
  `main`; use the `published-image` artifact rather than a digest copied into
  this document.
- Terraform apply baseline succeeded once with strict readiness checks.
- The AWS stack has been destroyed for cost control.
- Playwright, bounded ZAP, three k6 trials, CloudWatch collection, canonical
  aggregation, and cleanup are implemented but still require live evidence
  after a controlled apply.

## Scaling Notes

- ECS EC2/ASG should run across at least two Availability Zones during evidence
  collection.
- Rate limits are persisted in PostgreSQL so they remain effective across
  multiple ECS tasks. Cleanup of expired buckets is an operational maintenance
  concern.
