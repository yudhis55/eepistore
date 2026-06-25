import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../lib/generated/prisma/client";
import argon2 from "argon2";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Demo password for ALL seed accounts. Hashed with argon2 so login actually works.
const DEMO_PASSWORD = "password123";

async function main() {
  console.log("Seeding database...");
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // ─── Admin user ───
  const admin = await prisma.user.upsert({
    where: { email: "admin@eepistore.local" },
    update: { passwordHash }, // fix the placeholder hash so admin can log in
    create: {
      name: "Admin EEPISTORE",
      email: "admin@eepistore.local",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  // ─── Categories ───
  const categoryDefs = [
    { name: "Alat & Komponen Praktikum", icon: "cpu" },
    { name: "Buku, Modul & Alat Tulis", icon: "book" },
    { name: "Elektronik & Aksesoris Gadget", icon: "smartphone" },
    { name: "Merchandise Resmi", icon: "shirt" },
    { name: "Preloved / Barang Bekas", icon: "package" },
    { name: "Jasa Cetak/Print & Jilid", icon: "printer" },
  ];
  const catByName: Record<string, { id: string }> = {};
  for (const cat of categoryDefs) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    const record = existing ?? (await prisma.category.create({ data: cat }));
    catByName[cat.name] = record;
  }

  // ─── Sellers + verified stores ───
  type SellerSeed = {
    name: string;
    email: string;
    storeName: string;
    description: string;
    pickup: string;
  };
  const sellers: SellerSeed[] = [
    {
      name: "Rizki Pratama",
      email: "rizki@pens.student.id",
      storeName: "Rizki Electronics",
      description: "Jual komponen praktikum & Arduino bekas praktik. COD di gedung PSDKU.",
      pickup: "Depan Gedung PSDKU PENS",
    },
    {
      name: "Dewi Lestari",
      email: "dewi@pens.student.id",
      storeName: "Dewi Merch PENS",
      description: "Merchandise resmi himpunan & jasa cetak. Temu di lapangan PENS.",
      pickup: "Lapangan utama PENS",
    },
    {
      name: "Bagus Nugroho",
      email: "bagus@pens.student.id",
      storeName: "Preloved Bagus",
      description: "Barang preloved antar angkatan — kalkulator, jas lab, buku.",
      pickup: "Kantin PENS lt.1",
    },
  ];

  const storeBySeller: Record<string, { id: string; userId: string }> = {};
  for (const s of sellers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash,
        role: Role.SELLER,
        isVerifiedStudent: true,
        verificationStatus: "APPROVED",
        emailVerified: new Date(),
      },
    });
    const store = await prisma.storeProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        storeName: s.storeName,
        description: s.description,
        pickupLocation: s.pickup,
        status: "APPROVED",
      },
    });
    storeBySeller[s.email] = { id: store.id, userId: user.id };
  }

  // ─── Buyer (for reviews) ───
  const buyers = [
    { name: "Andi Wijaya", email: "andi@pens.student.id" },
    { name: "Siti Rahma", email: "siti@pens.student.id" },
    { name: "Fajar Hidayat", email: "fajar@pens.student.id" },
    { name: "Maya Putri", email: "maya@pens.student.id" },
  ];
  const buyerIds: Record<string, string> = {};
  for (const b of buyers) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: {
        name: b.name,
        email: b.email,
        passwordHash,
        role: Role.BUYER,
        isVerifiedStudent: true,
        verificationStatus: "APPROVED",
        emailVerified: new Date(),
      },
    });
    buyerIds[b.email] = user.id;
  }

  // ─── Products ───
  // Placeholder images (Unsplash, hot-link) — real product photos would live in S3.
  const img = (q: string) =>
    `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=600&q=70`;

  type ProductSeed = {
    sellerEmail: string;
    category: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    condition: "NEW" | "PRELOVED";
    image: string;
  };
  const products: ProductSeed[] = [
    {
      sellerEmail: "rizki@pens.student.id",
      category: "Alat & Komponen Praktikum",
      name: "Arduino Uno R3 + Kabel USB",
      description:
        "Arduino Uno R3 ori, masih mulus. Cocok untuk praktikum mikrokontroler. Sudah teruji.",
      price: 85000,
      stock: 5,
      condition: "PRELOVED",
      image: "1553406830-ef2513450d76",
    },
    {
      sellerEmail: "rizki@pens.student.id",
      category: "Alat & Komponen Praktikum",
      name: "Breadboard 830 titik + 65 Jumper Wire",
      description: "Set breadboard + jumper male-male 65pcs. Praktis untuk rangkaian prototipe.",
      price: 35000,
      stock: 12,
      condition: "NEW",
      image: "1518770660439-4636190af475",
    },
    {
      sellerEmail: "rizki@pens.student.id",
      category: "Alat & Komponen Praktikum",
      name: "Sensor Ultrasonik HC-SR04",
      description: "Sensor jarak ultrasonik HC-SR04 baru. Banyak dipakai tugas robotik.",
      price: 15000,
      stock: 20,
      condition: "NEW",
      image: "1581092160562-40aa08e78837",
    },
    {
      sellerEmail: "rizki@pens.student.id",
      category: "Elektronik & Aksesoris Gadget",
      name: "Charger USB 65W GaN",
      description: "Charger cepat 65W GaN, mendukung PD. Bekas 3 bulan, mulus.",
      price: 120000,
      stock: 2,
      condition: "PRELOVED",
      image: "1583863788434-e58a36330cf0",
    },
    {
      sellerEmail: "dewi@pens.student.id",
      category: "Merchandise Resmi",
      name: "Kaos HIMATRONIK 2026",
      description: "Kaos resmi himpunan Teknik Informatika, bahan combed 24s. Size M & L tersedia.",
      price: 75000,
      stock: 30,
      condition: "NEW",
      image: "1521572163474-6864f9cf17ab",
    },
    {
      sellerEmail: "dewi@pens.student.id",
      category: "Merchandise Resmi",
      name: "Tumbler PENS Logo",
      description: "Tumbler stainless 500ml berglogo PENS. Tahan panas 12 jam.",
      price: 55000,
      stock: 15,
      condition: "NEW",
      image: "1602143407151-7111542de6e8",
    },
    {
      sellerEmail: "dewi@pens.student.id",
      category: "Jasa Cetak/Print & Jilid",
      name: "Jasa Print & Jilid Skripsi",
      description: "Print hitam-putih A4 + jilid hardcover. Selesai 1 hari. COD kampus.",
      price: 25000,
      stock: 99,
      condition: "NEW",
      image: "1581291518857-4e27b48ff24e",
    },
    {
      sellerEmail: "bagus@pens.student.id",
      category: "Preloved / Barang Bekas",
      name: "Kalkulator Scientific Casio FX-570ES",
      description: "Kalkulator saintifik Casio, fungsi lengkap. Bekas pemakaian rapi.",
      price: 95000,
      stock: 1,
      condition: "PRELOVED",
      image: "1517336714731-489689fd1ca8",
    },
    {
      sellerEmail: "bagus@pens.student.id",
      category: "Preloved / Barang Bekas",
      name: "Jas Lab Putih Size L",
      description: "Jas lab putih, bahan tebal, size L. Sedikit noda di manset.",
      price: 40000,
      stock: 1,
      condition: "PRELOVED",
      image: "1581594693702-fbdc53dc97ad",
    },
    {
      sellerEmail: "bagus@pens.student.id",
      category: "Buku, Modul & Alat Tulis",
      name: "Buku Sistem Digital Tocci",
      description: "Buku ajar Sistem Digital edisi terjemahan. Mulus, tidak ada coretan.",
      price: 110000,
      stock: 1,
      condition: "PRELOVED",
      image: "1544947950-fa07a5d847c9",
    },
    {
      sellerEmail: "dewi@pens.student.id",
      category: "Buku, Modul & Alat Tulis",
      name: "Modul Praktikum Mikrokontroler 2025",
      description: "Modul praktikum cetak. Langsung siap pakai untuk sesi lab.",
      price: 30000,
      stock: 8,
      condition: "NEW",
      image: "1456513080510-7bf3a84b82f8",
    },
    {
      sellerEmail: "rizki@pens.student.id",
      category: "Alat & Komponen Praktikum",
      name: "Raspberry Pi 4B 4GB",
      description: "Raspberry Pi 4B 4GB + heatsink + case. Berfungsi normal, lengkap.",
      price: 650000,
      stock: 1,
      condition: "PRELOVED",
      image: "1564725073220-14c6f5b6efcf",
    },
  ];

  // Upsert products by name (so re-seeding is idempotent). We track created ids
  // for reviewable products (first 5 get reviews).
  const productIds: string[] = [];
  for (const p of products) {
    const store = storeBySeller[p.sellerEmail];
    const existing = await prisma.product.findFirst({ where: { name: p.name, storeId: store.id } });
    const record = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            categoryId: catByName[p.category].id,
            description: p.description,
            price: p.price,
            stock: p.stock,
            condition: p.condition,
            status: "ACTIVE",
          },
        })
      : await prisma.product.create({
          data: {
            storeId: store.id,
            categoryId: catByName[p.category].id,
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            condition: p.condition,
            status: "ACTIVE",
            images: { create: { imageUrl: img(p.image), altText: p.name, position: 0 } },
          },
          include: { images: true },
        });
    // Ensure a correct image exists for existing products (fixes URLs from a
    // prior buggy seed run — update the first image rather than only inserting).
    const firstImage = await prisma.productImage.findFirst({
      where: { productId: record.id },
      orderBy: { position: "asc" },
    });
    const correctUrl = img(p.image);
    if (!firstImage) {
      await prisma.productImage.create({
        data: { productId: record.id, imageUrl: correctUrl, altText: p.name, position: 0 },
      });
    } else if (firstImage.imageUrl !== correctUrl) {
      await prisma.productImage.update({
        where: { id: firstImage.id },
        data: { imageUrl: correctUrl, altText: p.name },
      });
    }
    productIds.push(record.id);
  }

  // ─── Completed orders + reviews (for trending + social proof) ───
  // Reviewable products: first 5. Each gets one completed order + a review.
  const reviews = [
    {
      buyerEmail: "andi@pens.student.id",
      rating: 5,
      comment: "Barang sesuai deskripsi, dikirim cepat. Penjual responsif. Recommended banget!",
    },
    {
      buyerEmail: "siti@pens.student.id",
      rating: 5,
      comment: "Kualitas bagus, harga mahasiswa. COD-nya rapi, ketemu tepat waktu.",
    },
    {
      buyerEmail: "fajar@pens.student.id",
      rating: 4,
      comment: "Produk oke, sedikit lecet tapi masih berfungsi normal. Overall puas.",
    },
    {
      buyerEmail: "maya@pens.student.id",
      rating: 5,
      comment: "Langganan beli komponen di sini. Selalu ready dan murah. Mantap!",
    },
    {
      buyerEmail: "andi@pens.student.id",
      rating: 5,
      comment: "Kaos-nya nyaman, sablon awet. Teman-teman pada nanya beli di mana.",
    },
  ];

  for (let i = 0; i < 5 && i < productIds.length; i++) {
    const productId = productIds[i];
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: { storeId: true, price: true },
    });
    const rv = reviews[i];
    const buyerId = buyerIds[rv.buyerEmail];

    // Skip if a review/order for this product already exists (idempotent).
    const existingOrder = await prisma.order.findFirst({
      where: { buyerId, storeId: product.storeId, items: { some: { productId } } },
    });
    if (existingOrder) continue;

    const order = await prisma.order.create({
      data: {
        buyerId,
        storeId: product.storeId,
        status: "SELESAI",
        paymentMethod: "MANUAL_TRANSFER",
        deliveryMethod: "PICKUP_COD",
        totalAmount: product.price,
        shippingCost: 0,
        items: { create: { productId, quantity: 1, priceAtPurchase: product.price } },
        payment: {
          create: { status: "VERIFIED", amount: product.price },
        },
      },
      include: { items: true },
    });

    const orderItem = order.items[0];
    await prisma.review.create({
      data: {
        userId: buyerId,
        productId,
        orderItemId: orderItem.id,
        rating: rv.rating,
        comment: rv.comment,
      },
    });
  }

  console.log("Seed complete:", {
    admin: admin.email,
    categories: categoryDefs.length,
    sellers: sellers.length,
    products: products.length,
    reviews: 5,
    demoPassword: DEMO_PASSWORD,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
