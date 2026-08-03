import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const severityNames = ["informational", "low", "medium", "high"];

export function normalizeZapReport(report, triage = {}) {
  const alerts = (report.site ?? []).flatMap((site) =>
    (site.alerts ?? []).map((alert) => ({ ...alert, site: site["@name"] ?? site.name ?? null })),
  );
  const findings = alerts.map((alert) => {
    const instance = alert.instances?.[0] ?? {};
    const identityParts = [
      String(alert.pluginid ?? alert.alertRef ?? ""),
      String(instance.uri ?? alert.site ?? ""),
      String(instance.param ?? ""),
      String(instance.method ?? "GET"),
    ];
    const findingId = crypto.createHash("sha256").update(identityParts.join("\n")).digest("hex");
    const decision = triage.findings?.[findingId] ?? {};
    return {
      findingId,
      ruleId: String(alert.pluginid ?? alert.alertRef ?? ""),
      name: String(alert.alert ?? "Unknown alert"),
      severity: severityNames[Number(alert.riskcode ?? 0)] ?? "informational",
      url: String(instance.uri ?? alert.site ?? ""),
      parameter: String(instance.param ?? ""),
      method: String(instance.method ?? "GET"),
      triageStatus: decision.status ?? "unreviewed",
      rationale: decision.rationale ?? null,
      reviewer: decision.reviewer ?? null,
    };
  });
  const bySeverity = Object.fromEntries(severityNames.map((severity) => [severity, 0]));
  for (const finding of findings) bySeverity[finding.severity] += 1;
  const blocking = findings.filter(
    (finding) =>
      ["high", "critical"].includes(finding.severity) &&
      !["false-positive", "accepted-context"].includes(finding.triageStatus),
  );
  return {
    schemaVersion: "2.0.0",
    status: blocking.length === 0 ? "passed" : "failed",
    total: findings.length,
    bySeverity,
    uniqueRules: new Set(findings.map((finding) => finding.ruleId).filter(Boolean)).size,
    findings,
    blocking: blocking.map(({ findingId, ruleId, name, severity, triageStatus }) => ({
      findingId,
      ruleId,
      name,
      severity,
      triageStatus,
    })),
  };
}

function main() {
  const reportPath = process.argv[2] ?? "zap-report.json";
  const outputPath = process.argv[3] ?? "runtime-evidence/zap-summary.json";
  const triagePath = process.argv[4] ?? "tests/security/zap-triage.json";
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const triage = fs.existsSync(triagePath) ? JSON.parse(fs.readFileSync(triagePath, "utf8")) : {};
  const summary = normalizeZapReport(report, triage);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  if (summary.blocking.length > 0) {
    throw new Error(
      `ZAP has ${summary.blocking.length} untriaged or confirmed high-risk finding(s)`,
    );
  }
  console.log(`ZAP gate passed; ${summary.total} alert(s), no residual high-risk findings.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
