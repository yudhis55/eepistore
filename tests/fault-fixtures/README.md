# Controlled security fixtures

These fixtures are positive controls for CI detection. They are never included
in the production Docker build context, published to ECR, or deployed to AWS.

- `auth/` applies exactly one deterministic authorization mutation in an
  ephemeral fault workflow. The mapped private-object unit test must fail.
- `sca/` contains a lockfile-only vulnerable dependency fixture. The workflow
  runs `npm audit --package-lock-only`; it never installs or executes package
  lifecycle code.

Every fault run starts from the approved parent commit. A fixture that does not
produce its expected finding is recorded as `invalid-fixture`, not as a passed
security control.
