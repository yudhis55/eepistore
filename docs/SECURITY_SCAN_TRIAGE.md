# Security Scan Triage

## npm audit

Last reviewed: 2026-07-05

The CI pipeline stores the raw `npm-audit.json` artifact and runs `scripts/audit-gate.mjs`. The gate fails any high or critical vulnerability unless every advisory ID is explicitly listed in `security/npm-audit-allowlist.json`.

### Resolved

- `nodemailer` high advisories were resolved by upgrading the direct application dependency to `nodemailer` `9.0.3`.
- `next-auth` `5.0.0-beta.31` still declares an optional peer dependency on `nodemailer` `^7.0.7`. Eepistore does not use the NextAuth Email Provider, so this peer mismatch is accepted for install resolution while the application-owned mailer uses the fixed direct version.
- Runtime image findings for `picomatch` and `sigstore` came from npm's global package tree in the Node base image. The production runner removes npm/npx and runs Prisma migrations through `node node_modules/prisma/build/index.js`.

### Accepted Temporarily

- None for high or critical findings.

### Not Accepted

Any new high or critical advisory that is not listed in `security/npm-audit-allowlist.json` must fail CI and be reviewed before image publication or deployment.
