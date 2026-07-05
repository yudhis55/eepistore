import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { getDatabaseUrl } from "../lib/database-url";
import argon2 from "argon2";

async function main() {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  const prisma = new PrismaClient({ adapter });

  const hash = await argon2.hash("Password123", { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email: "buyer@test.com" },
    update: { passwordHash: hash },
    create: {
      name: "Test Buyer",
      email: "buyer@test.com",
      passwordHash: hash,
      role: "BUYER",
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@eepistore.local" },
    update: { passwordHash: hash },
    create: {
      name: "Admin EEPISTORE",
      email: "admin@eepistore.local",
      passwordHash: hash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("Test users created:");
  console.log("  Admin: admin@eepistore.local / Password123");
  console.log("  Buyer: buyer@test.com / Password123");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
