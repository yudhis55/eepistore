import { expect, test } from "@playwright/test";

const accounts = [
  ["EXPERIMENT_BUYER_EMAIL", "Experiment Buyer"],
  ["EXPERIMENT_OTHER_BUYER_EMAIL", "Experiment Other Buyer"],
  ["EXPERIMENT_SELLER_EMAIL", "Experiment Seller"],
  ["EXPERIMENT_ADMIN_EMAIL", "Experiment Admin"],
] as const;

test("register isolated experiment accounts", async ({ browser }) => {
  const password = required("EXPERIMENT_PASSWORD");

  for (const [emailVariable, name] of accounts) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/register");
    await page.getByLabel("Nama").fill(name);
    await page.getByLabel("Email").fill(required(emailVariable));
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.getByRole("button", { name: "Daftar" }).click();
    const formAlert = page.locator('p[role="alert"]');
    await Promise.race([page.waitForURL(/\/$/), formAlert.waitFor({ state: "visible" })]);

    if (!/\/$/.test(page.url())) {
      const registrationError = (await formAlert.textContent())?.trim();
      if (!registrationError) {
        throw new Error("Registration stopped without a form error or successful redirect");
      }
      await page.goto("/login");
      await page.getByLabel("Email").fill(required(emailVariable));
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Masuk" }).click();
      await expect(page).toHaveURL(/\/$/);
    }
    await context.close();
  }
});

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}
