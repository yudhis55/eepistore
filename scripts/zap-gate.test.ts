import { describe, expect, it } from "vitest";
import { normalizeZapReport } from "./zap-gate.mjs";

const report = {
  site: [
    {
      "@name": "https://eepistore.web.id",
      alerts: [
        {
          pluginid: "10001",
          alert: "Controlled high finding",
          riskcode: "3",
          instances: [{ uri: "https://eepistore.web.id/products", param: "q", method: "GET" }],
        },
      ],
    },
  ],
};

describe("ZAP evidence normalization", () => {
  it("blocks an unreviewed high finding", () => {
    const result = normalizeZapReport(report);
    expect(result.status).toBe("failed");
    expect(result.blocking).toHaveLength(1);
    expect(result.findings[0].findingId).toMatch(/^[0-9a-f]{64}$/);
  });

  it("requires an explicit triage record to release the gate", () => {
    const first = normalizeZapReport(report);
    const findingId = first.findings[0].findingId;
    const result = normalizeZapReport(report, {
      findings: {
        [findingId]: {
          status: "false-positive",
          rationale: "Validated against the response and application control.",
          reviewer: "researcher",
        },
      },
    });
    expect(result.status).toBe("passed");
    expect(result.findings[0].reviewer).toBe("researcher");
  });
});
