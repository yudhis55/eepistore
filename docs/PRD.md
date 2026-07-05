# Product Requirement Document (PRD)

# EEPISTORE — Marketplace Jual Beli Mahasiswa PENS

| Dokumen        | Detail                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------- |
| Versi          | 1.0                                                                                         |
| Tanggal        | 23 Juni 2026                                                                                |
| Status         | Draft — Siap untuk fase eksekusi (AI-agent driven development)                              |
| Pemilik Produk | (diisi pemilik proyek)                                                                      |
| Target Stack   | Next.js (Fullstack) + PostgreSQL + AWS (ECS EC2/ASG, RDS, S3) + Terraform + CI/CD DevSecOps |

---

## 1. Executive Summary

**EEPISTORE** adalah platform marketplace berbasis web yang dikhususkan untuk ekosistem **Politeknik Elektronika Negeri Surabaya (PENS)**. Platform ini menjadi tempat jual-beli antar civitas akademika PENS — mulai dari kebutuhan akademis (alat tulis, modul, komponen elektronika praktikum), merchandise kampus/himpunan, hingga barang preloved mahasiswa.

EEPISTORE dibangun sebagai aplikasi **fullstack Next.js** dengan database **PostgreSQL**, dan akan menjadi objek studi sekaligus _real workload_ untuk pipeline **DevSecOps** (Terraform untuk provisioning AWS, CI/CD dengan security gate, kontainerisasi Docker, RDS, dan S3).

Proyek dikembangkan secara solo oleh satu orang dengan bantuan AI coding agent, sehingga seluruh requirement pada dokumen ini disusun cukup detail dan tidak bergantung pada tim/milestone manual — dokumen ini berfungsi sebagai _single source of truth_ yang akan langsung diterjemahkan menjadi task development oleh AI agent.

---

## 2. Latar Belakang & Problem Statement

Mahasiswa PENS memiliki kebutuhan rutin untuk:

- Membeli/menjual alat dan komponen praktikum (Arduino, sensor, kabel jumper, breadboard, dll).
- Membeli buku, modul, dan alat tulis perkuliahan.
- Menjual barang preloved antar angkatan (kalkulator, jas lab, dll).
- Membeli merchandise resmi kampus/himpunan mahasiswa (HMJ, BEM, UKM).

Saat ini transaksi semacam ini umumnya terjadi secara informal melalui grup WhatsApp/Line/Instagram per angkatan/jurusan, yang menyebabkan:

- Informasi produk tersebar dan tidak terstruktur (sulit dicari).
- Tidak ada riwayat transaksi atau sistem kepercayaan (rating/review).
- Tidak ada satu tempat resmi yang merepresentasikan identitas kampus.

**EEPISTORE** hadir untuk menyatukan aktivitas jual-beli ini dalam satu platform terstruktur, dengan identitas visual yang mencerminkan PENS, sekaligus aman dan dapat diaudit.

---

## 3. Tujuan Produk & Success Metrics

### Tujuan Produk

1. Menyediakan satu platform terpusat jual-beli untuk civitas akademika PENS.
2. Memberikan pengalaman belanja modern, cepat, dan mudah digunakan baik di desktop maupun mobile (responsive web).
3. Membangun fondasi marketplace yang aman, scalable, dan siap dikembangkan bertahap (multi-fase).
4. Menjadi _real-world workload_ yang representatif untuk pipeline DevSecOps (IaC + CI/CD + container security).

### Success Metrics (indikatif — disesuaikan setelah live)

| Metrik                                               | Target Awal                                       |
| ---------------------------------------------------- | ------------------------------------------------- |
| Jumlah seller aktif terdaftar                        | 50+ dalam 3 bulan pertama                         |
| Jumlah produk listing                                | 300+ dalam 3 bulan pertama                        |
| Transaksi selesai per bulan                          | 100+ setelah bulan ke-2                           |
| Tingkat keberhasilan checkout (cart → order selesai) | > 70%                                             |
| Uptime aplikasi                                      | ≥ 99% (non-mission-critical, tapi tetap dipantau) |
| Waktu render halaman utama (LCP)                     | < 2.5s                                            |

---

## 4. Target Pengguna & Persona

| Persona                                     | Deskripsi                                                                          | Kebutuhan Utama                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Buyer — Mahasiswa Reguler**               | Mahasiswa aktif PENS yang ingin membeli kebutuhan kuliah/merch                     | Pencarian cepat, harga jelas, metode bayar fleksibel (transfer/COD), histori pesanan  |
| **Seller — Mahasiswa Penjual**              | Mahasiswa yang berjualan komponen, jasa print, preloved, atau merchandise himpunan | Kemudahan upload produk, kelola stok, kelola pesanan, lihat statistik penjualan toko  |
| **Seller — UKM/Himpunan/UMKM Kampus Resmi** | Unit resmi kampus yang jual merchandise/produk kelembagaan                         | Branding toko, badge resmi, kontrol katalog                                           |
| **Admin — Pengelola Platform**              | Tim/penanggung jawab platform (bisa 1 orang di awal)                               | Moderasi user & produk, approval seller, monitoring transaksi, kelola konten homepage |

Catatan: berdasarkan keputusan scope, **verifikasi status mahasiswa bersifat opsional** — registrasi tetap terbuka untuk umum, namun user dapat mengajukan verifikasi (email kampus `@pens.ac.id` dan/atau NIM) untuk mendapatkan **badge "Verified PENS Student"** yang meningkatkan kredibilitas akun (baik sebagai buyer maupun seller).

---

## 5. Ruang Lingkup

Karena proyek ini dirancang **komprehensif (full-feature)** namun tetap dieksekusi bertahap oleh AI agent, ruang lingkup dipecah per fase (detail fase ada di Bab 18 — Roadmap). Ringkasan in/out-of-scope keseluruhan produk:

### In-Scope (keseluruhan produk, lintas fase)

- Multi-role: Admin, Seller, Buyer.
- Marketplace multi-vendor (banyak toko/seller dalam satu platform).
- Katalog produk dengan kategori & varian.
- Keranjang multi-seller, checkout, manajemen pesanan per toko.
- Pembayaran **manual transfer + COD** (tahap awal), dengan arsitektur yang dirancang agar mudah ditambahkan payment gateway (Midtrans/Xendit) di fase berikutnya.
- Verifikasi mahasiswa opsional (badge).
- Review, rating, wishlist, chat buyer-seller.
- Dashboard Admin, Seller, dan Buyer.
- Infrastruktur AWS via Terraform, kontainerisasi Docker, CI/CD dengan security scanning.

### Out-of-Scope (untuk versi ini / didokumentasikan sebagai batasan sadar)

- Pembayaran melalui kartu kredit/payment gateway otomatis (ditunda ke fase lanjutan — lihat roadmap).
- Integrasi API kurir resmi (JNE/J&T/dll) — pada fase awal pengiriman dilakukan manual (COD/ketemu di titik kampus).
- Aplikasi mobile native (iOS/Android) — versi awal adalah responsive web (PWA-ready).
- Fitur "joki tugas"/jasa akademik yang melanggar etika akademik **secara eksplisit tidak diakomodasi** sebagai kategori produk.
- Multi-bahasa (awal hanya Bahasa Indonesia).

---

## 6. Role & Hak Akses (Permission Matrix)

| Modul / Aksi                      | Buyer                               | Seller                    | Admin                  |
| --------------------------------- | ----------------------------------- | ------------------------- | ---------------------- |
| Registrasi & login                | ✅                                  | ✅ (upgrade dari buyer)   | ✅ (akun internal)     |
| Ajukan verifikasi student badge   | ✅                                  | ✅                        | —                      |
| Browse & cari produk              | ✅                                  | ✅                        | ✅                     |
| Tambah ke cart / wishlist         | ✅                                  | ✅ (sebagai buyer juga)   | —                      |
| Checkout & buat pesanan           | ✅                                  | ✅                        | —                      |
| Beri review & rating              | ✅ (setelah order selesai)          | ✅                        | —                      |
| Chat dengan toko                  | ✅                                  | ✅ (balas chat)           | —                      |
| Ajukan jadi Seller (buka toko)    | ✅                                  | —                         | Approve/Reject         |
| Kelola profil toko                | —                                   | ✅ (toko sendiri)         | ✅ (semua toko)        |
| CRUD produk                       | —                                   | ✅ (produk sendiri)       | ✅ (moderasi/takedown) |
| Kelola pesanan masuk              | —                                   | ✅ (pesanan toko sendiri) | ✅ (lihat semua)       |
| Verifikasi pembayaran manual      | —                                   | ✅ (pesanan toko sendiri) | ✅ (override)          |
| Kelola kategori produk            | —                                   | —                         | ✅                     |
| Kelola banner/promo homepage      | —                                   | —                         | ✅                     |
| Kelola voucher/diskon platform    | —                                   | —                         | ✅                     |
| Suspend/ban user                  | —                                   | —                         | ✅                     |
| Lihat laporan & analitik platform | Sebagian (toko sendiri jika seller) | Sebagian (toko sendiri)   | ✅ (penuh)             |
| Audit log aktivitas sensitif      | —                                   | —                         | ✅                     |

---

## 7. Functional Requirements

> Setiap modul ditulis sebagai ringkasan fitur + acceptance criteria inti, cukup detail untuk diterjemahkan langsung menjadi task implementasi oleh AI coding agent.

### 7.1 Autentikasi & Manajemen Akun

- Registrasi via email + password (dengan validasi kekuatan password).
- Login dengan email/password; sesi dikelola via secure HTTP-only cookie (NextAuth/Auth.js).
- Verifikasi email saat registrasi (kirim link/OTP).
- Lupa password / reset password via email.
- Edit profil (nama, no. HP, avatar — upload ke S3, alamat pengambilan/COD).
- **Pengajuan Verified Student Badge (opsional):**
  - User input email kampus `@pens.ac.id` dan/atau NIM + foto KTM (opsional).
  - Jika via email kampus → verifikasi otomatis lewat OTP ke email tersebut.
  - Jika via NIM/KTM manual → masuk antrian review Admin.
  - Setelah approved, badge "Verified PENS Student" tampil di profil & produk milik user tersebut.

**Acceptance Criteria inti:**

- User tidak bisa checkout tanpa email terverifikasi.
- Badge tidak bisa di-self-assign tanpa proses verifikasi (email OTP domain kampus ATAU approval admin).

### 7.2 Katalog Produk & Kategori

- Kategori multi-level, contoh awal:
  - Alat & Komponen Praktikum (Arduino, sensor, kabel, dll)
  - Buku, Modul & Alat Tulis
  - Elektronik & Aksesoris Gadget
  - Merchandise Resmi (Almamater, Jaket Jurusan/Himpunan, dll)
  - Preloved / Barang Bekas Mahasiswa
  - Jasa Cetak/Print & Jilid
- Produk memiliki: nama, deskripsi, harga, stok, multi-foto (S3), kategori, varian (misal warna/ukuran), status (draft/aktif/nonaktif/habis), kondisi (baru/preloved).
- Halaman detail produk menampilkan info toko, rating toko, dan rating produk.

### 7.3 Pencarian & Penemuan Produk

- Full-text search nama/deskripsi produk.
- Filter: kategori, rentang harga, kondisi (baru/preloved), rating toko, status verified seller.
- Sorting: terbaru, termurah, termahal, terpopuler, rating tertinggi.
- Halaman kategori & halaman toko (storefront per seller).

### 7.4 Keranjang & Checkout

- Cart mendukung multi-seller dalam satu cart, namun **order otomatis dipecah per toko** saat checkout (karena model marketplace multi-vendor).
- Pemilihan metode pengiriman/pengambilan per order:
  - **Ambil langsung / COD di titik kampus** (lokasi disepakati via chat atau lokasi default toko).
  - **Antar manual oleh seller** (opsional, diatur sendiri oleh seller).
- Pemilihan metode pembayaran (Fase 1):
  - **Transfer manual** → buyer upload bukti transfer (gambar ke S3) → status order "Menunggu Konfirmasi Pembayaran" → seller/admin verifikasi → status lanjut ke "Diproses".
  - **COD** → order langsung berstatus "Diproses", pembayaran dilakukan saat barang diterima; seller menandai "Pembayaran Diterima" setelah serah terima.
- Ringkasan order menampilkan rincian per toko, ongkir manual (jika diinput seller), dan total per toko.

### 7.5 Manajemen Pesanan (Order Lifecycle)

Status order (umum untuk kedua metode bayar):

1. `Menunggu Pembayaran` (khusus transfer manual)
2. `Menunggu Konfirmasi Pembayaran` (bukti sudah diupload, menunggu verifikasi seller/admin)
3. `Diproses` (pembayaran terkonfirmasi / COD diterima sistem)
4. `Siap Diambil / Dikirim`
5. `Selesai` (dikonfirmasi buyer atau auto-complete setelah X hari)
6. `Dibatalkan` (oleh buyer sebelum diproses, atau oleh seller/admin dengan alasan)

- Buyer dapat membatalkan order selama masih `Menunggu Pembayaran`.
- Seller dapat menolak/membatalkan order dengan alasan (stok habis, dll) — stok otomatis dikembalikan.
- Notifikasi otomatis (in-app + email) pada setiap perubahan status.

### 7.6 Manajemen Toko (Seller)

- Onboarding: buyer mengajukan "Buka Toko" → isi profil toko (nama, deskripsi, logo, lokasi pengambilan default) → masuk antrian approval Admin.
- Dashboard Seller: ringkasan penjualan, daftar pesanan masuk (dengan aksi konfirmasi/tolak/update status), manajemen produk (CRUD + bulk update stok), pengaturan toko, riwayat ulasan.
- Statistik dasar: total penjualan, produk terlaris, grafik tren transaksi (chart).

### 7.7 Review, Rating, & Wishlist

- Review & rating produk **hanya bisa diisi setelah order berstatus Selesai**.
- Rating toko dihitung agregat dari rating semua produk/order toko tersebut.
- Wishlist produk (simpan untuk dibeli nanti).

### 7.8 Chat / Pesan Buyer–Seller

- Chat 1:1 per produk/per toko untuk negosiasi, koordinasi COD, atau tanya stok.
- Riwayat chat tersimpan, notifikasi pesan baru.
- Admin dapat melihat chat untuk keperluan moderasi/dispute (dengan audit log akses).

### 7.9 Notifikasi

- In-app notification center (order update, chat baru, status verifikasi badge, status approval toko).
- Email notification untuk event penting (order dibuat, pembayaran terkonfirmasi, order selesai, akun di-suspend).

### 7.10 Dashboard Admin

- Manajemen user: lihat daftar, suspend/ban, reset verifikasi.
- Approval pengajuan toko baru & approval verified student badge (manual review).
- Moderasi produk (takedown produk yang melanggar aturan/kategori terlarang).
- Manajemen kategori produk (CRUD).
- Manajemen banner promosi & konten homepage.
- Manajemen voucher/diskon platform (fase lanjutan).
- Laporan & analitik: total transaksi, GMV (estimasi), seller teraktif, kategori terlaris.
- Audit log: siapa melakukan aksi sensitif apa dan kapan (approval, suspend, override status order, dll).
- Penanganan dispute sederhana (form komplain buyer/seller → tiket → resolusi admin).

### 7.11 Promo & Voucher (Fase Lanjutan)

- Admin membuat kode voucher (persentase/nominal, syarat minimum belanja, kuota, periode berlaku).
- Buyer input kode voucher saat checkout.

---

## 8. Non-Functional Requirements

| Kategori            | Requirement                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Performance**     | LCP < 2.5s pada koneksi 4G; API response time < 300ms untuk operasi baca umum                                |
| **Scalability**     | Aplikasi stateless (session via DB/JWT) agar container bisa di-scale horizontal di ECS EC2/ASG               |
| **Availability**    | Target uptime ≥ 99%; health check endpoint untuk load balancer                                               |
| **Usability**       | Responsive penuh (mobile-first), aksesibilitas dasar (kontras warna WCAG AA, alt-text gambar produk)         |
| **Maintainability** | Kode terstruktur modular (feature-based folder di Next.js), dokumentasi API, type-safety penuh (TypeScript)  |
| **Observability**   | Structured logging, error tracking, metrics dasar (request rate, error rate, latency) terkirim ke CloudWatch |
| **Security**        | Lihat Bab 13 secara khusus                                                                                   |
| **Data Integrity**  | Transaksi order & stok menggunakan DB transaction (atomic) untuk mencegah race condition saat checkout       |

---

## 9. UX/UI & Brand Guideline

### Prinsip Desain

- **Modern, clean, sleek** — hindari elemen generik/"AI slop" (no gradient ungu-biru generik, no ilustrasi 3D abstrak template, no font default tanpa hierarki).
- Tipografi tegas dengan hierarki jelas (1 font display untuk heading, 1 font sans untuk body — misal kombinasi seperti **Inter/Geist** untuk UI, atau font dengan karakter teknik/elektronika yang tetap rapi).
- Layout grid konsisten, whitespace cukup, microinteraction halus (hover state, skeleton loading, bukan spinner generik).
- Dark mode opsional sebagai pengembangan lanjutan (bukan prioritas fase awal).

### Palet Warna — Diturunkan dari Identitas PENS

Logo PENS bercirikan **biru tua (navy)** sebagai warna identitas institusi elektronika/teknik, dipadukan **aksen kuning/emas (gold-amber)** yang merepresentasikan unsur elektronik/energi, di atas elemen netral putih/abu pada lambang. EEPISTORE menurunkan brand-nya dari kombinasi ini agar terasa "milik PENS" namun tetap modern untuk konteks e-commerce:

| Token              | Peran                                            | Referensi Hex (starting point) |
| ------------------ | ------------------------------------------------ | ------------------------------ |
| `--brand-navy-900` | Primary (header, CTA utama, brand mark)          | `#0A2A5E`                      |
| `--brand-navy-700` | Primary hover/active                             | `#123E84`                      |
| `--brand-gold-500` | Secondary/Accent (badge, highlight, harga promo) | `#F2A900`                      |
| `--brand-gold-300` | Accent lembut (hover state ringan)               | `#FBCB5C`                      |
| `--neutral-900`    | Teks utama                                       | `#111418`                      |
| `--neutral-500`    | Teks sekunder                                    | `#6B7280`                      |
| `--neutral-100`    | Background card/section                          | `#F4F5F7`                      |
| `--surface-white`  | Background utama                                 | `#FFFFFF`                      |
| `--success`        | Status sukses (order selesai)                    | `#1E9E5A`                      |
| `--warning`        | Status pending (menunggu pembayaran)             | `#E8A23D`                      |
| `--danger`         | Status gagal/dibatalkan                          | `#D6473C`                      |

> **Catatan implementasi:** hex di atas adalah titik awal yang masuk akal secara visual; sebelum implementasi final, ambil hex _exact_ dari file logo resmi PENS/EEPISTORE (vector asset) menggunakan color picker, lalu kunci sebagai design token di `tailwind.config` agar konsisten di seluruh aplikasi.

### Komponen Kunci

- Design system berbasis **Tailwind CSS + shadcn/ui** (dikustomisasi dengan token warna di atas, bukan tema default).
- Komponen wajib: Product Card, Store Card, Order Status Badge (berwarna sesuai status), Empty State illustration custom (bukan stok generik), Dashboard layout (sidebar + topbar) untuk Admin/Seller.

---

## 10. Arsitektur Teknis

### 10.1 Application Layer

- **Framework:** Next.js (App Router), fullstack — UI + API Route Handlers/Server Actions dalam satu codebase.
- **Bahasa:** TypeScript end-to-end (frontend, backend, schema validation).
- **ORM:** Prisma (atau Drizzle) untuk PostgreSQL — migration terkelola sebagai kode.
- **Auth:** Auth.js (NextAuth) — credentials provider (email/password) di fase awal, dengan struktur siap tambah OAuth (Google) di fase lanjutan.
- **Validasi:** Zod di setiap boundary input (form & API).
- **Styling:** Tailwind CSS + shadcn/ui, custom design token (Bab 9).
- **State/Data Fetching:** React Server Components + Server Actions untuk mutasi; React Query/SWR untuk data client-side yang butuh refetch (chat, notifikasi).
- **File Upload:** Presigned URL ke **S3** (upload langsung dari browser, tidak melalui server app, untuk efisiensi).

### 10.2 Data Layer

- **Database:** PostgreSQL, dihosting di **AWS RDS** (Multi-AZ opsional untuk fase produksi matang).
- **Object Storage:** **AWS S3** untuk gambar produk, avatar, bukti transfer, foto KTM verifikasi.
- **Cache (opsional fase lanjutan):** Redis (ElastiCache) untuk session/rate-limit jika traffic meningkat.

### 10.3 Deployment & Infrastructure

- **Containerization:** Aplikasi Next.js di-build sebagai Docker image (multi-stage build untuk image kecil).
- **Container Registry:** AWS ECR.
- **Compute:** AWS ECS EC2 launch type dengan Auto Scaling Group di belakang Application Load Balancer, selaras dengan rancangan infrastruktur BAB 3.
- **Networking:** VPC kustom (public subnet untuk ALB, private subnet untuk ECS task & RDS).
- **DNS/TLS:** Route53 + ACM (HTTPS wajib end-to-end).
- **IaC:** **Terraform**, modular per komponen (`network`, `rds`, `s3`, `ecs`, `iam`, `alb`, `cicd`) — state disimpan di S3 backend dengan DynamoDB lock table.
- **Secrets:** AWS Secrets Manager / SSM Parameter Store — tidak ada credential hardcoded atau di `.env` yang masuk repo.

### 10.4 CI/CD & DevSecOps Pipeline (gambaran tahapan)

1. **Lint & Type Check** (ESLint, `tsc --noEmit`).
2. **Unit & Integration Test** (Vitest/Jest).
3. **SAST** (CodeQL / Semgrep) terhadap kode aplikasi.
4. **Dependency/SCA Scan** (`npm audit` / Snyk / OSV-Scanner).
5. **Build Docker Image** → **Container Image Scan** (Trivy) sebelum push ke ECR.
6. **IaC Scan** (`tfsec` / Checkov) terhadap kode Terraform sebelum `terraform plan/apply`.
7. **Terraform Plan** (manual/automated approval gate) → **Apply** ke environment target.
8. **Deploy** ke ECS (rolling update) → **Smoke Test** otomatis.
9. **DAST** (OWASP ZAP baseline scan) terhadap environment staging secara berkala.
10. **Notifikasi pipeline** (status build/deploy) ke channel monitoring.

---

## 11. Data Model (Ringkasan Entitas)

> ERD detail disusun saat implementasi (Prisma schema). Berikut entitas inti dan relasi utamanya.

| Entitas                    | Field Kunci                                                                                                  | Relasi                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `User`                     | id, name, email, password_hash, role(enum: BUYER/SELLER/ADMIN), nim, is_verified_student, avatar_url         | 1—1 `StoreProfile` (jika seller), 1—N `Order`, `Review`, `Address` |
| `StoreProfile`             | id, user_id, store_name, description, logo_url, pickup_location, status(pending/approved/rejected/suspended) | 1—N `Product`                                                      |
| `Category`                 | id, name, parent_id (self-relation), icon                                                                    | 1—N `Product`                                                      |
| `Product`                  | id, store_id, category_id, name, description, price, stock, condition(new/preloved), status                  | 1—N `ProductImage`, `ProductVariant`, `Review`                     |
| `Order`                    | id, buyer_id, store_id, status, payment_method(MANUAL_TRANSFER/COD), total_amount, delivery_method           | 1—N `OrderItem`; 1—1 `Payment`                                     |
| `OrderItem`                | id, order_id, product_id, qty, price_at_purchase                                                             | —                                                                  |
| `Payment`                  | id, order_id, proof_image_url (nullable utk COD), verified_by, verified_at, status                           | —                                                                  |
| `Address`                  | id, user_id, label, detail                                                                                   | —                                                                  |
| `Review`                   | id, order_item_id, rating, comment                                                                           | —                                                                  |
| `Wishlist`                 | id, user_id, product_id                                                                                      | —                                                                  |
| `Conversation` / `Message` | id, buyer_id, store_id, message, sender_id, created_at                                                       | —                                                                  |
| `Notification`             | id, user_id, type, payload, is_read                                                                          | —                                                                  |
| `Voucher` (fase lanjutan)  | id, code, discount_type, value, quota, valid_from/to                                                         | —                                                                  |
| `AuditLog`                 | id, actor_id, action, target_entity, target_id, metadata, created_at                                         | —                                                                  |

---

## 12. API Design — Overview

Pendekatan: Route Handlers Next.js (`/app/api/...`) untuk operasi yang dipanggil client-side dinamis (chat, notifikasi real-time-ish via polling), dan **Server Actions** untuk mutasi form-based (create product, checkout, dsb) demi mengurangi boilerplate.

Contoh pengelompokan endpoint (indikatif, bukan exhaustive):

- `POST /api/auth/register`, `POST /api/auth/verify-email`
- `GET /api/products`, `GET /api/products/[id]`, `POST /api/products` (seller)
- `POST /api/cart/checkout`
- `GET /api/orders`, `PATCH /api/orders/[id]/status`
- `POST /api/payments/[orderId]/upload-proof`, `PATCH /api/payments/[id]/verify` (seller/admin)
- `POST /api/stores/apply`, `PATCH /api/admin/stores/[id]/approve`
- `POST /api/students/verify`, `PATCH /api/admin/students/[id]/approve`
- `GET /api/admin/reports/sales`
- `POST /api/uploads/presign` (generate presigned URL S3)

Semua endpoint yang memerlukan otorisasi divalidasi melalui middleware RBAC berdasarkan role di session.

---

## 13. Keamanan (Security Requirements)

Mengingat proyek ini sekaligus menjadi objek pipeline DevSecOps, requirement keamanan diperlakukan sebagai _first-class requirement_, bukan tambahan:

- **Password:** hashing dengan bcrypt/argon2, minimum kompleksitas password saat registrasi.
- **Session:** HTTP-only, secure, SameSite cookie; rotasi token berkala.
- **RBAC:** middleware terpusat memverifikasi role pada setiap route sensitif (server-side, tidak hanya hide-UI).
- **Input Validation:** Zod schema di setiap input form & API — mencegah injection dan malformed data.
- **File Upload Security:** validasi tipe & ukuran file sebelum generate presigned URL; (opsional fase lanjutan) scanning malware pada file yang diupload ke S3.
- **Rate Limiting:** endpoint sensitif (login, register, upload bukti pembayaran, checkout) dibatasi rate-nya untuk mencegah brute-force/abuse.
- **CSRF Protection:** ditangani oleh mekanisme Auth.js/Server Actions Next.js secara default, dipastikan tidak dinonaktifkan.
- **Secrets Management:** seluruh credential (DB, S3, SMTP) disimpan di AWS Secrets Manager/SSM, diinject ke container saat runtime — tidak pernah commit ke repo.
- **Least Privilege IAM:** setiap service (ECS task role, CI/CD role) memiliki IAM policy paling minimal sesuai kebutuhannya.
- **Encryption:** RDS encryption-at-rest aktif; S3 bucket encryption (SSE-S3/SSE-KMS) aktif; HTTPS wajib (TLS 1.2+) end-to-end via ACM.
- **Audit Logging:** seluruh aksi admin sensitif (approve/reject, suspend, override status) tercatat di `AuditLog`.
- **Dependency & Container Hygiene:** SCA scan dan container image scan menjadi _quality gate_ di pipeline CI/CD (build gagal jika ditemukan critical vulnerability tanpa exception yang didokumentasikan).
- **IaC Security:** Terraform di-scan (tfsec/Checkov) untuk mencegah misconfiguration (misal S3 bucket public, security group terlalu permisif).

---

## 14. Compliance & Privasi Data

- Mematuhi prinsip dasar **UU PDP (Undang-Undang Pelindungan Data Pribadi)**: pengumpulan data seminimal mungkin (data mining purpose-limited), persetujuan eksplisit saat user submit data sensitif (NIM, foto KTM untuk verifikasi).
- Sediakan mekanisme **hapus akun** (right to erasure) yang menghapus/mengaburkan data pribadi sesuai kebijakan retensi.
- Foto KTM/data verifikasi disimpan terenkripsi dan hanya dapat diakses Admin untuk keperluan verifikasi (akses tercatat di audit log).

---

## 15. Asumsi & Batasan

- Pengembangan dilakukan solo dengan bantuan AI coding agent — dokumen ini ditulis cukup eksplisit agar dapat langsung diterjemahkan ke task implementasi tanpa perlu klarifikasi tim.
- Tahap awal payment hanya manual transfer & COD; arsitektur `Payment` & `Order` dirancang agar penambahan payment gateway tidak memerlukan perubahan struktur data besar (cukup tambah `payment_method` baru + integrasi callback).
- Skala awal ditargetkan untuk traffic internal kampus (ribuan user), bukan skala nasional — keputusan resource sizing AWS (ECS task size, RDS instance class) disesuaikan kecil/hemat biaya di awal dan dapat di-scale via Terraform variable.

---

## 16. Risiko & Mitigasi

| Risiko                                      | Dampak                                      | Mitigasi                                                                                                                  |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Penipuan pada transfer manual (bukti palsu) | Kerugian buyer/seller                       | Verifikasi manual oleh seller/admin sebelum status "Diproses"; rencana migrasi ke payment gateway terverifikasi di Fase 3 |
| Single point of failure (1 developer)       | Keterlambatan maintenance                   | Dokumentasi lengkap (PRD ini + ADR teknis), infra full-as-code (Terraform) agar reproducible                              |
| Data pribadi mahasiswa (NIM, KTM) bocor     | Pelanggaran privasi, reputasi               | Enkripsi data, akses terbatas role Admin, audit log akses                                                                 |
| Rendahnya adopsi awal                       | Marketplace sepi (efek "empty marketplace") | Onboarding awal terarah ke himpunan/UKM sebagai seller resmi pertama untuk isi katalog                                    |
| Kerentanan dependency/container             | Eksploitasi keamanan                        | Gate otomatis SCA + container scan di CI/CD, tidak ada deploy jika critical vulnerability terbuka                         |

---

## 17. Roadmap & Fase Pengembangan

Meskipun lingkup produk dirancang komprehensif, eksekusi dipecah menjadi fase agar AI-agent-driven development tetap terarah dan dapat diuji bertahap:

### Fase 0 — Foundation

Setup repo, Terraform base infra (VPC, RDS, S3, ECR), pipeline CI/CD dasar (lint, test, build, deploy ke staging), skema database inti, sistem auth & RBAC dasar.

### Fase 1 — Core Marketplace (MVP fungsional)

Katalog produk & kategori, profil toko, cart & checkout (manual transfer + COD), order lifecycle dasar, dashboard Buyer/Seller/Admin versi inti.

### Fase 2 — Trust & Engagement

Verified student badge, review & rating, wishlist, chat buyer-seller, notifikasi in-app & email, audit log lengkap.

### Fase 3 — Growth & Monetization

Voucher/diskon, banner promo homepage, laporan & analitik lanjutan, integrasi payment gateway (Midtrans/Xendit) sebagai opsi tambahan di samping manual transfer.

### Fase 4 — Scale & Hardening

Integrasi API kurir (opsional), caching layer (Redis), WAF di depan ALB/CloudFront untuk asset statis, load testing & tuning, evaluasi Multi-AZ RDS untuk high-availability.

---

## 18. Lampiran

### 18.1 Glossary

- **GMV** — Gross Merchandise Value, total nilai transaksi yang melewati platform.
- **COD** — Cash on Delivery, pembayaran saat barang diterima/diambil.
- **SAST/DAST/SCA** — Static/Dynamic Application Security Testing, Software Composition Analysis.
- **IaC** — Infrastructure as Code.

### 18.2 Pertanyaan Terbuka untuk Iterasi Berikutnya

- Apakah Admin perlu lebih dari 1 akun (super-admin vs admin-moderator) di fase awal?
- Apakah ongkos kirim manual perlu kalkulasi otomatis berbasis jarak (Google Maps API) di fase lanjutan, atau cukup input manual oleh seller?
- Apakah perlu limit jumlah toko per user (1 user = 1 toko) untuk menyederhanakan model data di Fase 1?

---

_Dokumen ini adalah living document — disarankan disimpan di repository sebagai `docs/PRD.md` dan diperbarui setiap kali ada keputusan produk baru selama proses development berlangsung._
