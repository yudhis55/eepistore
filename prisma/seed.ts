import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Admin user ───
  const admin = await prisma.user.upsert({
    where: { email: "admin@eepistore.local" },
    update: {},
    create: {
      name: "Admin EEPISTORE",
      email: "admin@eepistore.local",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$placeholder",
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  // ─── Categories ───
  const categories = [
    { name: "Alat & Komponen Praktikum", icon: "cpu" },
    { name: "Buku, Modul & Alat Tulis", icon: "book" },
    { name: "Elektronik & Aksesoris Gadget", icon: "smartphone" },
    { name: "Merchandise Resmi", icon: "shirt" },
    { name: "Preloved / Barang Bekas", icon: "package" },
    { name: "Jasa Cetak/Print & Jilid", icon: "printer" },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  console.log("Seed complete:", {
    admin: admin.email,
    categories: categories.length,
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
