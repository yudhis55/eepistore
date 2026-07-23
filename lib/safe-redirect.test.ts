import { describe, expect, it } from "vitest";
import { safeRelativeRedirect } from "@/lib/safe-redirect";

describe("safeRelativeRedirect", () => {
  it("allows local paths", () => {
    expect(safeRelativeRedirect("/orders?checkout=success")).toBe("/orders?checkout=success");
  });

  it("rejects absolute, protocol-relative, and backslash redirects", () => {
    expect(safeRelativeRedirect("https://evil.example")).toBe("/");
    expect(safeRelativeRedirect("//evil.example")).toBe("/");
    expect(safeRelativeRedirect("/\\evil.example")).toBe("/");
  });
});
