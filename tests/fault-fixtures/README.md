# Controlled security fixtures

These fixtures are positive controls for CI detection. They are never included
in the production Docker build context, published to ECR, or deployed to AWS.

- `auth/` applies exactly one deterministic authorization mutation in an
  ephemeral fault workflow. The mapped private-object unit test must fail.
- The SCA positive control is generated under `.fault-runtime/sca/` only on the
  GitHub Actions runner. Its manifest and lockfile are recorded in the
  ephemeral child commit before `npm audit --package-lock-only` runs. The
  vulnerable package is never installed or executed, and the child commit is
  never pushed.

Every fault run starts from the approved parent commit. A fixture that does not
produce its expected finding is recorded as `invalid-fixture`, not as a passed
security control.
