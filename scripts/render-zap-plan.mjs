import fs from "node:fs";

const target = new URL(process.argv[2]);
if (target.protocol !== "https:") throw new Error("ZAP target must use HTTPS");
const output = process.argv[3] ?? "runtime-evidence/zap-plan.yaml";
const escaped = target.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const template = fs.readFileSync("tests/security/zap-plan.template.yaml", "utf8");
fs.mkdirSync("runtime-evidence", { recursive: true });
fs.writeFileSync(
  output,
  template
    .replaceAll("__TARGET_URL_JSON__", JSON.stringify(target.origin))
    .replaceAll("__TARGET_REGEX_JSON__", JSON.stringify(`${escaped}.*`))
    .replaceAll(
      "__STATE_CHANGING_REGEX_JSON__",
      JSON.stringify(`${escaped}/api/(admin|auth|chat|orders|uploads).*`),
    )
    .replaceAll(
      "__AUTHENTICATED_PAGE_REGEX_JSON__",
      JSON.stringify(`${escaped}/(admin|dashboard|orders).*`),
    ),
);
