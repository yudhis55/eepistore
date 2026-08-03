import { describe, expect, it } from "vitest";
import { renderZapPlan } from "./render-zap-plan.mjs";

const template = `
target=__TARGET_URL_JSON__
root=__PUBLIC_ROOT_REGEX_JSON__
catalog=__PUBLIC_CATALOG_REGEX_JSON__
health=__PUBLIC_HEALTH_REGEX_JSON__
excluded=__STATE_CHANGING_REGEX_JSON__
`;

describe("bounded ZAP plan rendering", () => {
  it("allows only the owned HTTPS domain and excludes state-changing routes", () => {
    const plan = renderZapPlan("https://eepistore.web.id", template);
    expect(plan).toContain("products|stores");
    expect(plan).toContain("health|readiness");
    expect(plan).toContain("register|reset-password|wishlist");
    expect(plan).not.toContain("__PUBLIC_");
  });

  it("rejects an external or non-HTTPS target", () => {
    expect(() => renderZapPlan("https://example.com", template)).toThrow(/owned Eepistore/);
    expect(() => renderZapPlan("http://eepistore.web.id", template)).toThrow(/owned Eepistore/);
  });
});
