import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function renderZapPlan(targetValue, template) {
  const target = new URL(targetValue);
  if (target.protocol !== "https:" || target.hostname !== "eepistore.web.id") {
    throw new Error("ZAP target must be the owned Eepistore HTTPS domain");
  }
  const escaped = target.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return template
    .replaceAll("__TARGET_URL_JSON__", JSON.stringify(target.origin))
    .replaceAll("__PUBLIC_ROOT_REGEX_JSON__", JSON.stringify(`${escaped}/?(?:\\?.*)?$`))
    .replaceAll(
      "__PUBLIC_CATALOG_REGEX_JSON__",
      JSON.stringify(`${escaped}/(?:products|stores)(?:/[^/?#]+)?/?(?:\\?.*)?$`),
    )
    .replaceAll(
      "__PUBLIC_HEALTH_REGEX_JSON__",
      JSON.stringify(`${escaped}/api/(?:health|readiness)/?(?:\\?.*)?$`),
    )
    .replaceAll(
      "__STATE_CHANGING_REGEX_JSON__",
      JSON.stringify(
        `${escaped}/(?:api/(?:admin|auth|chat|orders|uploads)|admin|cart|chat|checkout|dashboard|forgot-password|login|notifications|orders|profile|register|reset-password|wishlist).*`,
      ),
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const targetValue = process.argv[2];
  if (!targetValue) throw new Error("ZAP target URL is required");
  const output = process.argv[3] ?? "runtime-evidence/zap-plan.yaml";
  const template = fs.readFileSync("tests/security/zap-plan.template.yaml", "utf8");
  fs.mkdirSync("runtime-evidence", { recursive: true });
  fs.writeFileSync(output, renderZapPlan(targetValue, template));
}
