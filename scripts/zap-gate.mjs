import fs from "node:fs";

const report = JSON.parse(fs.readFileSync(process.argv[2] ?? "zap-report.json", "utf8"));
const alerts = (report.site ?? []).flatMap((site) => site.alerts ?? []);
const blocking = alerts.filter((alert) => Number(alert.riskcode ?? 0) >= 3);
const bySeverity = { informational: 0, low: 0, medium: 0, high: 0 };
const severityNames = ["informational", "low", "medium", "high"];

for (const alert of alerts) {
  const severity = severityNames[Number(alert.riskcode ?? 0)] ?? "informational";
  bySeverity[severity] += 1;
}

const summary = {
  schemaVersion: "1.0.0",
  status: blocking.length === 0 ? "passed" : "failed",
  total: alerts.length,
  bySeverity,
  uniqueRules: [
    ...new Set(alerts.map((alert) => String(alert.pluginid ?? alert.alertRef ?? ""))),
  ].filter(Boolean).length,
  blocking: blocking.map((alert) => ({
    ruleId: String(alert.pluginid ?? alert.alertRef ?? ""),
    name: String(alert.alert ?? "Unknown alert"),
    risk: String(alert.riskdesc ?? "High"),
  })),
};
fs.mkdirSync("runtime-evidence", { recursive: true });
fs.writeFileSync(
  process.argv[3] ?? "runtime-evidence/zap-summary.json",
  JSON.stringify(summary, null, 2),
);

if (blocking.length > 0) {
  console.error("ZAP found blocking high-risk alerts:");
  for (const alert of blocking) {
    console.error(`- ${alert.alert}: ${alert.riskdesc}`);
  }
  process.exit(1);
}

console.log(`ZAP gate passed; ${alerts.length} alert(s), no high-risk findings.`);
