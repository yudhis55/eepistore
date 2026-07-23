import fs from "node:fs";

const target = new URL(process.argv[2]);
if (target.protocol !== "https:") throw new Error("ZAP target must use HTTPS");
const output = process.argv[3] ?? "runtime-evidence/zap-plan.yaml";
const escaped = target.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const yamlEscapedRegex = escaped.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
const template = fs.readFileSync("tests/security/zap-plan.template.yaml", "utf8");
fs.mkdirSync("runtime-evidence", { recursive: true });
fs.writeFileSync(
  output,
  template
    .replaceAll("{{TARGET_URL}}", target.origin)
    .replaceAll("{{TARGET_REGEX}}", yamlEscapedRegex),
);
