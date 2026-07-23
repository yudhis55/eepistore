import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.ts";
import { getDatabaseUrl } from "../lib/database-url.ts";

type FixtureConfig = {
  experimentId: string;
  buyerEmail: string;
  otherBuyerEmail: string;
  sellerEmail: string;
  adminEmail: string;
};

const action = process.argv[2];
const config = readConfig();

if (action === "validate") {
  console.log(
    `EXPERIMENT_FIXTURE_VALIDATION_JSON=${JSON.stringify({
      experimentId: config.experimentId,
      status: "passed",
    })}`,
  );
} else {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  const prisma = new PrismaClient({ adapter });

  try {
    if (action === "setup") {
      console.log(`EXPERIMENT_FIXTURE_JSON=${JSON.stringify(await setup(prisma, config))}`);
    } else if (action === "cleanup") {
      console.log(`EXPERIMENT_CLEANUP_JSON=${JSON.stringify(await cleanup(prisma, config))}`);
    } else {
      throw new Error("Expected action setup, cleanup, or validate");
    }
  } finally {
    await prisma.$disconnect();
  }
}

function readConfig(): FixtureConfig {
  const experimentId = required("EXPERIMENT_ID");
  if (!/^[a-zA-Z0-9_-]{6,80}$/.test(experimentId)) {
    throw new Error("EXPERIMENT_ID contains unsupported characters");
  }

  const config = {
    experimentId,
    buyerEmail: required("EXPERIMENT_BUYER_EMAIL"),
    otherBuyerEmail: required("EXPERIMENT_OTHER_BUYER_EMAIL"),
    sellerEmail: required("EXPERIMENT_SELLER_EMAIL"),
    adminEmail: required("EXPERIMENT_ADMIN_EMAIL"),
  };

  for (const email of [
    config.buyerEmail,
    config.otherBuyerEmail,
    config.sellerEmail,
    config.adminEmail,
  ]) {
    if (!email.includes(experimentId) || !email.endsWith("@example.invalid")) {
      throw new Error("Fixture email must be scoped to EXPERIMENT_ID and example.invalid");
    }
  }

  return config;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function setup(prisma: PrismaClient, input: FixtureConfig) {
  return prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: {
        email: {
          in: [input.buyerEmail, input.otherBuyerEmail, input.sellerEmail, input.adminEmail],
        },
      },
    });
    if (users.length !== 4) {
      throw new Error(`Expected four registered users, found ${users.length}`);
    }

    const byEmail = new Map(users.map((user) => [user.email, user]));
    const buyer = byEmail.get(input.buyerEmail)!;
    const otherBuyer = byEmail.get(input.otherBuyerEmail)!;
    const seller = byEmail.get(input.sellerEmail)!;
    const admin = byEmail.get(input.adminEmail)!;

    await tx.user.update({
      where: { id: buyer.id },
      data: { role: "BUYER", emailVerified: new Date() },
    });
    await tx.user.update({
      where: { id: otherBuyer.id },
      data: { role: "BUYER", emailVerified: new Date() },
    });
    await tx.user.update({
      where: { id: seller.id },
      data: {
        role: "SELLER",
        emailVerified: new Date(),
        isVerifiedStudent: true,
        verificationStatus: "APPROVED",
      },
    });
    await tx.user.update({
      where: { id: admin.id },
      data: { role: "ADMIN", emailVerified: new Date() },
    });

    const store = await tx.storeProfile.upsert({
      where: { userId: seller.id },
      update: {
        storeName: `Experiment Store ${input.experimentId}`,
        status: "APPROVED",
      },
      create: {
        userId: seller.id,
        storeName: `Experiment Store ${input.experimentId}`,
        description: "Deterministic store for the controlled thesis experiment.",
        pickupLocation: "Experiment fixture",
        status: "APPROVED",
      },
    });
    const category = await tx.category.upsert({
      where: { name: "Experiment Fixtures" },
      update: {},
      create: { name: "Experiment Fixtures", icon: "flask-conical" },
    });

    const productName = `Experiment Product ${input.experimentId}`;
    const existingProduct = await tx.product.findFirst({
      where: { storeId: store.id, name: productName },
    });
    const product = existingProduct
      ? await tx.product.update({
          where: { id: existingProduct.id },
          data: { categoryId: category.id, stock: 100, status: "ACTIVE" },
        })
      : await tx.product.create({
          data: {
            storeId: store.id,
            categoryId: category.id,
            name: productName,
            description: "Controlled experiment fixture. Safe to delete.",
            price: 10000,
            stock: 100,
            condition: "NEW",
            status: "ACTIVE",
          },
        });

    const checkoutToken = `experiment-${input.experimentId}`;
    const existingOrder = await tx.order.findUnique({
      where: {
        buyerId_checkoutToken_storeId: {
          buyerId: buyer.id,
          checkoutToken,
          storeId: store.id,
        },
      },
      include: { payment: true },
    });
    const order =
      existingOrder ??
      (await tx.order.create({
        data: {
          buyerId: buyer.id,
          storeId: store.id,
          checkoutToken,
          paymentMethod: "MANUAL_TRANSFER",
          deliveryMethod: "PICKUP_COD",
          totalAmount: 10000,
          notes: `experiment:${input.experimentId}`,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              priceAtPurchase: 10000,
            },
          },
          payment: {
            create: {
              amount: 10000,
              status: "PENDING",
            },
          },
        },
        include: { payment: true },
      }));

    return {
      experimentId: input.experimentId,
      users: {
        buyerId: buyer.id,
        otherBuyerId: otherBuyer.id,
        sellerId: seller.id,
        adminId: admin.id,
      },
      storeId: store.id,
      productId: product.id,
      orderId: order.id,
      paymentId: order.payment?.id ?? null,
    };
  });
}

async function cleanup(prisma: PrismaClient, input: FixtureConfig) {
  return prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: {
        email: {
          in: [input.buyerEmail, input.otherBuyerEmail, input.sellerEmail, input.adminEmail],
        },
      },
      include: { storeProfile: true },
    });
    const userIds = users.map((user) => user.id);
    const storeIds = users.flatMap((user) => (user.storeProfile ? [user.storeProfile.id] : []));

    await tx.message.deleteMany({ where: { senderId: { in: userIds } } });
    await tx.conversation.deleteMany({
      where: {
        OR: [{ buyerId: { in: userIds } }, { storeId: { in: storeIds } }],
      },
    });
    await tx.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
    await tx.order.deleteMany({
      where: {
        OR: [{ buyerId: { in: userIds } }, { storeId: { in: storeIds } }],
      },
    });
    await tx.cartItem.deleteMany({ where: { userId: { in: userIds } } });
    await tx.user.deleteMany({ where: { id: { in: userIds } } });

    return {
      experimentId: input.experimentId,
      removedUsers: userIds.length,
      removedStores: storeIds.length,
    };
  });
}
