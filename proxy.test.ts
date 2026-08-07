import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: (handler: (request: unknown) => unknown) => handler,
}));

import proxy from "./proxy";

describe("proxy authentication responses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns JSON 401 for an anonymous protected API request", async () => {
    const response = await proxyRequest("/api/uploads/private?key=payments/test/proof.png");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns JSON 403 for a suspended user calling a protected API", async () => {
    const response = await proxyRequest("/api/uploads/private", {
      user: { id: "suspended-user", role: "BUYER", suspended: true },
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Account suspended" });
  });

  it("keeps browser-page authentication as a login redirect", async () => {
    const response = await proxyRequest("/orders");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://eepistore.web.id/login?callbackUrl=%2Forders",
    );
  });
});

async function proxyRequest(path: string, auth: unknown = null): Promise<Response> {
  const url = new URL(path, "https://eepistore.web.id");
  return (await proxy(
    {
      auth,
      nextUrl: url,
      url: url.toString(),
    } as never,
    {} as never,
  )) as Response;
}
