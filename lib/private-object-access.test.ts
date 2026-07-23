import { describe, expect, it } from "vitest";
import {
  canReadPrivateObject,
  objectUrlMatchesKey,
  parsePrivateObjectKey,
  parsePrivateObjectUrl,
  type PrivateObjectLookup,
  type PrivateObjectSessionUser,
} from "@/lib/private-object-access";

function user(id: string, role: PrivateObjectSessionUser["role"]): PrivateObjectSessionUser {
  return { id, role };
}

function lookup(access: {
  payment?: { buyerId: string; sellerUserId: string } | null;
  verification?: { userId: string } | null;
}): PrivateObjectLookup {
  return {
    findPaymentAccessByKey: async () => access.payment ?? null,
    findVerificationAccessByKey: async () => access.verification ?? null,
  };
}

describe("private object access", () => {
  it("parses supported private object keys", () => {
    expect(parsePrivateObjectKey("payments/buyer-1/proof.png")).toEqual({
      key: "payments/buyer-1/proof.png",
      folder: "payments",
      ownerId: "buyer-1",
    });
  });

  it("rejects invalid or traversal keys", () => {
    expect(parsePrivateObjectKey("../payments/buyer-1/proof.png")).toBeNull();
    expect(parsePrivateObjectKey("/payments/buyer-1/proof.png")).toBeNull();
    expect(parsePrivateObjectKey("products/buyer-1/image.png")).toBeNull();
    expect(parsePrivateObjectKey("payments//proof.png")).toBeNull();
  });

  it("matches encoded app URLs and raw object keys", () => {
    const key = "payments/buyer-1/proof.png";
    expect(
      objectUrlMatchesKey(
        "https://app.example.test/api/uploads/private?key=payments%2Fbuyer-1%2Fproof.png",
        key,
      ),
    ).toBe(true);
    expect(objectUrlMatchesKey(key, key)).toBe(true);
    expect(objectUrlMatchesKey(`https://evil.test/${key}`, key)).toBe(false);
    expect(objectUrlMatchesKey(`${key}-suffix`, key)).toBe(false);
  });

  it("extracts only private application object URLs", () => {
    const key = "payments/buyer-1/proof.png";
    expect(
      parsePrivateObjectUrl(
        "https://app.example.test/api/uploads/private?key=payments%2Fbuyer-1%2Fproof.png",
      ),
    ).toMatchObject({ key, folder: "payments", ownerId: "buyer-1" });
    expect(parsePrivateObjectUrl(`https://evil.test/${key}`)).toBeNull();
  });

  it("allows payment proof access to buyer, owning seller, and admin", async () => {
    const object = parsePrivateObjectKey("payments/buyer-1/proof.png");
    expect(object).not.toBeNull();

    const access = lookup({ payment: { buyerId: "buyer-1", sellerUserId: "seller-1" } });

    await expect(canReadPrivateObject(user("buyer-1", "BUYER"), object!, access)).resolves.toBe(
      true,
    );
    await expect(canReadPrivateObject(user("seller-1", "SELLER"), object!, access)).resolves.toBe(
      true,
    );
    await expect(canReadPrivateObject(user("admin-1", "ADMIN"), object!, access)).resolves.toBe(
      true,
    );
  });

  it("rejects payment proof access for a seller that does not own the order store", async () => {
    const object = parsePrivateObjectKey("payments/buyer-1/proof.png");
    expect(object).not.toBeNull();

    await expect(
      canReadPrivateObject(
        user("seller-2", "SELLER"),
        object!,
        lookup({ payment: { buyerId: "buyer-1", sellerUserId: "seller-1" } }),
      ),
    ).resolves.toBe(false);
  });

  it("allows verification image access only to owner or admin when a record exists", async () => {
    const object = parsePrivateObjectKey("verifications/user-1/ktm.png");
    expect(object).not.toBeNull();

    const access = lookup({ verification: { userId: "user-1" } });

    await expect(canReadPrivateObject(user("user-1", "BUYER"), object!, access)).resolves.toBe(
      true,
    );
    await expect(canReadPrivateObject(user("admin-1", "ADMIN"), object!, access)).resolves.toBe(
      true,
    );
    await expect(canReadPrivateObject(user("user-2", "BUYER"), object!, access)).resolves.toBe(
      false,
    );
  });

  it("rejects admin access when the private object has no backing record", async () => {
    const object = parsePrivateObjectKey("payments/buyer-1/missing.png");
    expect(object).not.toBeNull();

    await expect(canReadPrivateObject(user("admin-1", "ADMIN"), object!, lookup({}))).resolves.toBe(
      false,
    );
  });
});
