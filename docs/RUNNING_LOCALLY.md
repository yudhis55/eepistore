# Cara Menjalankan EEPISTORE di Local

## Prasyarat

Pastikan software berikut sudah terinstall di komputer Anda:

| Software       | Versi Minimum | Cek Versi          |
| -------------- | ------------- | ------------------ |
| Node.js        | v22+          | `node --version`   |
| npm            | v10+          | `npm --version`    |
| Docker Desktop | v28+          | `docker --version` |
| Git            | v2.40+        | `git --version`    |

> **Catatan:** Docker Desktop harus dalam keadaan **running** (ikon Docker di system tray berwarna hijau).

---

## Step 1: Install Dependencies

Buka terminal/PowerShell di folder project, lalu jalankan:

```bash
cd "C:\PA LJ\eepistore"
npm install
```

---

## Step 2: Jalankan Docker Services (Database + Storage + Email)

EEPISTORE butuh 3 service di background: PostgreSQL, MinIO (S3-compatible), dan MailHog (email test).

```bash
npm run dev:up
```

Ini menjalankan `docker compose up -d` yang akan:

- **PostgreSQL** di port `5433` (bukan 5432, untuk hindari konflik dengan PostgreSQL lokal jika ada)
- **MinIO** di port `9000` (S3) + `9001` (console web)
- **MailHog** di port `1025` (SMTP) + `8025` (UI web)

Cek apakah semua service healthy:

```bash
docker compose ps
```

Semua harus status `Up (healthy)`.

> Untuk menghentikan services: `npm run dev:down`
> Untuk menghentikan + hapus data: `docker compose down -v`

---

## Step 3: Setup Environment File

File `.env` sudah ada di project. Jika belum, salin dari `.env.example`:

```bash
cp .env.example .env
```

Lalu edit `.env`, pastikan `DATABASE_URL` menggunakan port `5433`:

```
DATABASE_URL=postgresql://eepistore:eepistore@localhost:5433/eepistore?schema=public
```

---

## Step 4: Generate Prisma Client

```bash
npm run db:generate
```

---

## Step 5: Jalankan Database Migration

```bash
npm run db:migrate
```

Jika diminta nama migration, ketik: `init`

Atau jika migration sudah ada dan hanya ingin apply:

```bash
npx prisma migrate deploy
```

---

## Step 6: Seed Database (Data Awal)

```bash
npm run db:seed
```

Ini akan membuat:

- 1 akun Admin (`admin@eepistore.local`)
- 6 kategori produk (Alat Praktikum, Buku, Elektronik, Merchandise, Preloved, Jasa Print)

---

## Step 7: Buat Akun Test (Opsional tapi disarankan)

Akun admin dari seed memiliki password placeholder. Untuk membuat akun dengan password yang bisa dipakai login:

```bash
npx tsx scripts/create-test-users.ts
```

Akun yang dibuat:

| Role  | Email                   | Password      |
| ----- | ----------------------- | ------------- |
| Admin | `admin@eepistore.local` | `Password123` |
| Buyer | `buyer@test.com`        | `Password123` |

---

## Step 8: Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan jalan di **http://localhost:3000** (port 3000, bukan 300).

Buka browser dan akses: **http://localhost:3000**

---

## Service URLs

Setelah aplikasi running, Anda bisa mengakses:

| Service                | URL                              | Keterangan                                                        |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------- |
| **Aplikasi EEPISTORE** | http://localhost:3000            | Halaman utama                                                     |
| **MinIO Console**      | http://localhost:9001            | Lihat/manage file upload (user: `minioadmin`, pass: `minioadmin`) |
| **MailHog UI**         | http://localhost:8025            | Cek email yang dikirim aplikasi (reset password, dll)             |
| **Health Check**       | http://localhost:3000/api/health | Cek status DB + Storage                                           |

---

## Panduan Review Aplikasi

### Sebagai Buyer

1. Login dengan `buyer@test.com` / `Password123`
2. Browse produk di `/products`, gunakan search dan filter kategori
3. Klik produk untuk lihat detail, tekan tombol **Wishlist** atau **+ Keranjang**
4. Buka `/cart`, atur quantity, lalu **Checkout**
5. Pilih metode pengiriman (COD / Diantar) dan pembayaran (Transfer / COD)
6. Lihat pesanan di `/orders`
7. Jika Transfer Manual: upload bukti pembayaran
8. Edit profil di `/profile`, coba ajukan Verified Student Badge

### Sebagai Seller (butuh approval Admin dulu)

1. Login sebagai buyer, buka `/dashboard`
2. Isi form "Buka Toko" (nama toko, deskripsi, lokasi COD)
3. Login sebagai admin, buka `/admin/stores`, **Setujui** toko
4. Login kembali sebagai buyer (sekarang seller), buka `/dashboard`
5. Klik **+ Tambah Produk**, isi form + upload foto
6. Cek pesanan masuk di `/dashboard/orders`

### Sebagai Admin

1. Login dengan `admin@eepistore.local` / `Password123`
2. Dashboard admin di `/admin` (statistik, GMV)
3. Kelola toko: `/admin/stores` (approve/reject)
4. Kelola kategori: `/admin/categories` (CRUD)
5. Verifikasi student: `/admin/verifications`
6. Moderasi produk: `/admin/products` (takedown)
7. Kelola user: `/admin/users` (suspend/unsuspend)
8. Kelola voucher: `/admin/vouchers`
9. Kelola banner: `/admin/banners`
10. Laporan: `/admin/reports`

---

## Troubleshooting

### Port 5433 sudah dipakai

Edit `docker-compose.yml`, ganti `"5433:5432"` ke port lain (misal `"5434:5432"`), lalu update `DATABASE_URL` di `.env`.

### Error: Authentication failed against database server

Pastikan Docker services running (`docker compose ps`). Jika masih error, hapus volume dan recreate:

```bash
docker compose down -v
npm run dev:up
npx prisma migrate deploy
npm run db:seed
```

### Error: Cannot find module

Jalankan ulang:

```bash
npm install
npm run db:generate
```

### Aplikasi tidak bisa diakses

- Pastikan `npm run dev` masih running di terminal (jangan ditutup)
- Cek output terminal untuk error
- Pastikan tidak ada aplikasi lain yang pakai port 3000

### Upload foto gagal

- Pastikan MinIO running (`docker compose ps`)
- Cek MinIO Console di http://localhost:9001
- Bucket `eepistore` harus ada (dibuat otomatis oleh `minio-init` container)

### Email reset password tidak masuk

- Buka MailHog UI di http://localhost:8025
- Email test terkirim ke sana, bukan ke email sungguhan

---

## Perintah Cepat (Copy-Paste)

Jika mulai dari awal (fresh setup):

```bash
cd "C:\PA LJ\eepistore"
npm install
npm run dev:up
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npx tsx scripts/create-test-users.ts
npm run dev
```

Setelah selesai review, tekan `Ctrl+C` di terminal untuk stop dev server, lalu:

```bash
npm run dev:down
```

untuk menghentikan Docker services.
