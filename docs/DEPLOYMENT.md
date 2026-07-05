# Deployment Checklist — EEPISTORE

## Dev → Prod Transition (Config-Driven, Zero Code Change)

The only difference between dev and prod is environment variables. No code changes needed.

## Environment Variables (Prod)

| Variable                | Dev Value                                                   | Prod Value                 |
| ----------------------- | ----------------------------------------------------------- | -------------------------- |
| `NODE_ENV`              | development                                                 | production                 |
| `DATABASE_URL`          | `postgresql://eepistore:eepistore@localhost:5433/eepistore` | RDS connection string      |
| `AUTH_SECRET`           | dev secret                                                  | `openssl rand -base64 32`  |
| `AUTH_URL`              | `http://localhost:3000`                                     | `https://eepistore.domain` |
| `S3_ENDPOINT`           | `http://localhost:9000` (MinIO)                             | empty (AWS default)        |
| `S3_BUCKET`             | eepistore                                                   | prod bucket name           |
| `S3_REGION`             | us-east-1                                                   | AWS region                 |
| `S3_PUBLIC_BASE_URL`    | `http://localhost:9000/eepistore`                           | CloudFront media URL       |
| `AWS_ACCESS_KEY_ID`     | minioadmin                                                  | omit; use ECS task role    |
| `AWS_SECRET_ACCESS_KEY` | minioadmin                                                  | omit; use ECS task role    |
| `S3_FORCE_PATH_STYLE`   | true                                                        | false (or omit)            |
| `SMTP_HOST`             | localhost                                                   | SES SMTP endpoint          |
| `SMTP_PORT`             | 1025                                                        | 587                        |
| `SMTP_USER`             | (empty)                                                     | SES SMTP username          |
| `SMTP_PASS`             | (empty)                                                     | SES SMTP password          |
| `SMTP_FROM`             | noreply@eepistore.local                                     | noreply@eepistore.domain   |

## Pre-Deployment Steps

1. **Database Migration**
   - Run `npx prisma migrate deploy` against prod RDS
   - Verify all migrations applied

2. **Seed Admin User**
   - Create admin user manually or via seed script
   - Change default admin password immediately

3. **S3 Bucket Setup**
   - Create private bucket with encryption and versioning
   - Block public access
   - Serve public media through CloudFront Origin Access Control
   - Keep payment proof and verification documents private

4. **Docker Image**
   - Build: `docker build -f docker/Dockerfile -t eepistore:<commit-sha> .`
   - Verify non-root user (nextjs:1001)
   - Verify standalone output

5. **CI/CD Pipeline**
   - All gates must pass: lint, typecheck, test, SAST, SCA, Trivy scan
   - No critical vulnerabilities

## Production Checklist

- [ ] HTTPS enabled (TLS 1.2+ via ACM/ALB)
- [ ] Security headers active (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting active (login, register, upload, checkout)
- [ ] Database connection pooling configured
- [ ] S3 bucket encryption enabled
- [ ] Public media served through CloudFront, not public S3
- [ ] Secrets in AWS Secrets Manager / SSM (not in env files)
- [ ] Health check endpoint (`/api/health`) responding 200
- [ ] Readiness endpoint (`/api/readiness`) reports database and storage checks
- [ ] Graceful shutdown handling
- [ ] Log aggregation to CloudWatch
- [ ] Backup strategy (RDS automated backups)

## Graceful Shutdown

The Next.js standalone server handles SIGTERM gracefully.
ECS service deployments send SIGTERM to the container before replacing tasks.

## Scaling Considerations

- ECS EC2/ASG: run at least two ECS container instances across two AZs and scale service desired count based on CPU/memory
- RDS: db.t3.micro for dev, upgrade based on connection count
- Rate limiter is in-memory; for multi-instance, migrate to Redis-backed
