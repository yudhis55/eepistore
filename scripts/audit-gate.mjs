import fs from "node:fs";
import path from "node:path";

const auditPath = process.argv[2] ?? "npm-audit.json";
const allowlistPath = process.argv[3] ?? "security/npm-audit-allowlist.json";
const blockingSeverities = new Set(["high", "critical"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function advisoryIds(vulnerability) {
  return (vulnerability.via ?? [])
    .filter((item) => typeof item === "object" && item.url)
    .map((item) => item.url.match(/GHSA-[a-z0-9-]+/i)?.[0])
    .filter(Boolean);
}

const audit = readJson(auditPath);
const allowlist = readJson(allowlistPath).allowedAdvisories ?? {};

const accepted = [];
const failing = [];

for (const vulnerability of Object.values(audit.vulnerabilities ?? {})) {
  if (!blockingSeverities.has(vulnerability.severity)) {
    continue;
  }

  const ids = advisoryIds(vulnerability);
  const allAllowed = ids.length > 0 && ids.every((id) => allowlist[id]);

  if (allAllowed) {
    accepted.push({
      name: vulnerability.name,
      severity: vulnerability.severity,
      advisories: ids,
    });
  } else {
    failing.push({
      name: vulnerability.name,
      severity: vulnerability.severity,
      advisories: ids.length ? ids : ["unresolved-transitive-advisory"],
    });
  }
}

if (accepted.length) {
  console.log("Accepted high/critical advisories:");
  for (const item of accepted) {
    console.log(`- ${item.name} (${item.severity}): ${item.advisories.join(", ")}`);
  }
}

if (failing.length) {
  console.error("Blocking high/critical advisories:");
  for (const item of failing) {
    console.error(`- ${item.name} (${item.severity}): ${item.advisories.join(", ")}`);
  }
  process.exit(1);
}

console.log("npm audit gate passed for high/critical severity.");
