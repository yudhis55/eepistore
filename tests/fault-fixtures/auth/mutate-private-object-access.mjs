import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const source = path.resolve(
  args.find((argument) => argument !== "--check") ?? "lib/private-object-access.ts",
);
const original =
  'return user.role === "ADMIN" || user.id === access.buyerId || user.id === access.sellerUserId;';
const mutation =
  'return user.role === "ADMIN" || user.id === access.buyerId || user.role === "SELLER";';
const content = fs.readFileSync(source, "utf8");
if (!content.includes(original) || content.includes(mutation)) {
  throw new Error("FI-AUTH-01 precondition failed; baseline helper changed");
}
if (checkOnly) {
  console.log("FI-AUTH-01 fixture is applicable");
} else {
  fs.writeFileSync(source, content.replace(original, mutation));
  console.log("FI-AUTH-01 mutation applied");
}
