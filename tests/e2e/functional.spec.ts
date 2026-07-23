import { expect, request, test, type Browser, type BrowserContext } from "@playwright/test";
import fs from "node:fs";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nXQAAAAASUVORK5CYII=",
  "base64",
);

test("role-aware functional and storage checks", async ({ browser, baseURL }) => {
  const fixture = JSON.parse(
    fs.readFileSync(process.env.EXPERIMENT_FIXTURE_FILE ?? "runtime-evidence/fixture.json", "utf8"),
  ) as {
    orderId: string;
    paymentId: string;
  };
  const buyer = await authenticated(browser, required("EXPERIMENT_BUYER_EMAIL"));
  const otherBuyer = await authenticated(browser, required("EXPERIMENT_OTHER_BUYER_EMAIL"));
  const seller = await authenticated(browser, required("EXPERIMENT_SELLER_EMAIL"));
  const admin = await authenticated(browser, required("EXPERIMENT_ADMIN_EMAIL"));

  await expectStatus(buyer, "/orders", 200);
  await expectStatus(seller, "/dashboard", 200);
  await expectStatus(admin, "/admin", 200);

  const publicObject = await upload(seller, "products", "experiment-public.png");
  const client = await request.newContext();
  await expect
    .poll(
      async () => {
        const response = await client.get(publicObject.objectUrl);
        return response.status();
      },
      {
        message: "public object should become available through CloudFront",
        timeout: 30_000,
      },
    )
    .toBe(200);
  await client.dispose();

  const privateObject = await upload(buyer, "payments", "experiment-payment.png");
  const proofResponse = await buyer.request.post(`/api/orders/${fixture.orderId}/upload-proof`, {
    data: {
      proofImageUrl: privateObject.objectUrl,
      paymentId: fixture.paymentId,
    },
  });
  expect(proofResponse.status()).toBe(200);

  for (const context of [buyer, seller, admin]) {
    const response = await context.request.get(privateObject.objectUrl, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
  }
  const denied = await otherBuyer.request.get(privateObject.objectUrl, { maxRedirects: 0 });
  expect(denied.status()).toBe(403);
  const traversal = await buyer.request.get(
    `${baseURL}/api/uploads/private?key=..%2Fpayments%2Finvalid.png`,
    { maxRedirects: 0 },
  );
  expect(traversal.status()).toBe(400);

  await Promise.all([buyer.close(), otherBuyer.close(), seller.close(), admin.close()]);
});

async function authenticated(browser: Browser, email: string): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(required("EXPERIMENT_PASSWORD"));
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/$/);
  return context;
}

async function upload(context: BrowserContext, folder: "products" | "payments", filename: string) {
  const presign = await context.request.post("/api/uploads/presign", {
    maxRedirects: 0,
    data: {
      filename,
      contentType: "image/png",
      fileSize: png.byteLength,
      folder,
    },
  });
  expect(presign.status()).toBe(200);
  const signed = (await presign.json()) as { uploadUrl: string; key: string };

  const put = await context.request.put(signed.uploadUrl, {
    data: png,
    headers: { "Content-Type": "image/png" },
  });
  expect(put.ok()).toBeTruthy();

  const confirm = await context.request.post("/api/uploads/confirm", {
    data: { key: signed.key, contentType: "image/png" },
  });
  expect(confirm.status()).toBe(200);
  return (await confirm.json()) as { objectUrl: string };
}

async function expectStatus(context: BrowserContext, path: string, status: number) {
  const response = await context.request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(status);
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}
