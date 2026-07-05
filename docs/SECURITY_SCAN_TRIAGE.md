# Security Scan Triage

## npm audit

Last reviewed: 2026-07-05

The CI pipeline stores the raw `npm-audit.json` artifact and runs `scripts/audit-gate.mjs`. The gate fails any high or critical vulnerability unless every advisory ID is explicitly listed in `security/npm-audit-allowlist.json`.

### Accepted Temporarily

- `nodemailer` advisories `GHSA-c7w3-x93f-qmm8`, `GHSA-vvjj-xcjg-gr5g`, `GHSA-268h-hp4c-crq3`, `GHSA-wqvq-jvpq-h66f`, `GHSA-r7g4-qg5f-qqm2`, and `GHSA-p6gq-j5cr-w38f`.
- Reason: `npm audit` reports no fixed version. Eepistore uses Nodemailer only for password reset email through `lib/email.ts`, with SMTP host/port/auth from environment variables, a constant subject, and no user-controlled raw headers, List-* comments, OAuth2 token fetching, JSON transport, or raw message option.
- Follow-up: replace SMTP/Nodemailer with a fixed upstream release or an AWS SES API integration when available before claiming the mail subsystem is fully free of high SCA findings.

### Not Accepted

Any new high or critical advisory that is not listed in `security/npm-audit-allowlist.json` must fail CI and be reviewed before image publication or deployment.
