# Production Readiness

Dokumen ini menjelaskan kontrak produksi aplikasi `eepistore` sebagai target
deployment ECS EC2/ASG.

## Runtime Contract

Environment wajib:

- `NODE_ENV=production`
- `AUTH_URL=https://<domain>`
- `AUTH_SECRET` dari Secrets Manager
- `RDS_HOST` mengarah ke RDS Proxy endpoint
- `RDS_PORT=5432`
- `RDS_DATABASE`
- `RDS_USERNAME` dari Secrets Manager
- `RDS_PASSWORD` dari Secrets Manager
- `S3_BUCKET`
- `S3_REGION`
- `S3_PUBLIC_BASE_URL` untuk URL media publik melalui CloudFront
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`
- `SMTP_USER`, `SMTP_PASS` dari Secrets Manager jika email aktif

Environment opsional untuk lokal:

- `DATABASE_URL`
- `S3_ENDPOINT`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE=true`

## Storage Policy

- Folder `products`, `avatars`, dan `banners` adalah media publik dan harus
  disajikan melalui CloudFront.
- Folder `payments` dan `verifications` adalah objek sensitif dan tidak boleh
  menghasilkan URL publik langsung.
- Browser upload memakai presigned PUT URL.
- Download objek sensitif harus lewat route aplikasi yang melakukan authorization
  berbasis relasi data: buyer pemilik order, seller pemilik store pada order,
  admin, atau pemilik pengajuan verifikasi.

## Deployment Policy

- Image ECS memakai immutable commit SHA.
- `latest` boleh dipush untuk debugging, tetapi tidak boleh menjadi sumber
  deploy production.
- Migration database dijalankan sebagai step eksplisit sebelum traffic produksi
  dialihkan. Image runtime harus menyediakan command `npx prisma migrate deploy`.
- `/api/health` adalah liveness check ringan untuk ALB rolling deployment.
- `/api/readiness` mengecek dependency kritis seperti database dan S3.

## Evidence BAB 4

Pipeline harus menyimpan:

- build/test logs,
- SAST/SCA/container scan,
- deployment event,
- ZAP report,
- k6/JMeter summary,
- CloudWatch metrics/logs,
- post-apply verification output.
