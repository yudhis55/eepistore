import fs from "node:fs";

const report = JSON.parse(fs.readFileSync(process.argv[2] ?? "zap-report.json", "utf8"));
const alerts = (report.site ?? []).flatMap((site) => site.alerts ?? []);
const blocking = alerts.filter((alert) => Number(alert.riskcode ?? 0) >= 3);

if (blocking.length > 0) {
  console.error("ZAP found blocking high-risk alerts:");
  for (const alert of blocking) {
    console.error(`- ${alert.alert}: ${alert.riskdesc}`);
  }
  process.exit(1);
}

console.log(`ZAP gate passed; ${alerts.length} alert(s), no high-risk findings.`);
