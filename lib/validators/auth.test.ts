import { describe, it, expect } from "vitest";
import { emailSchema, passwordSchema } from "@/lib/validators/auth";

describe("auth validators", () => {
  it("accepts valid email", () => {
    expect(emailSchema.safeParse("user@pens.ac.id").success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("accepts strong password", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(true);
  });

  it("rejects short password", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });

  it("rejects password without number", () => {
    expect(passwordSchema.safeParse("PasswordOnly").success).toBe(false);
  });
});
