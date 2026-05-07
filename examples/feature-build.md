# Feature Build Example

Reference files: `references/quality-gates.md`, `references/session-topology.md`

## Request

Add a new provider target for a coding harness.

## Classification

Feature build. It changes installer behavior, docs, validation, examples, and public claims.

## Spec Gate

```text
Problem: users need a scaffold target for the harness.
Non-goals: no native marketplace package, no hidden metadata, no credential handling.
Behavior: init supports --target <new-target>, copies only validated public files, refuses overwrite without --force.
Docs: integration page includes status label and tested scope.
Acceptance: validate, smoke-test, and pack dry-run pass.
```

No code is written before the spec gate is accepted.

## Implementation-Plan Gate

```text
Files:
- bin/basd-coding-dispatch.mjs
- scripts/validate.mjs
- scripts/smoke-test.mjs
- integrations/<new-target>/install.md
- README.md

Steps:
1. Add failing smoke-test coverage for the new target.
2. Add the target to CLI target maps.
3. Add validation coverage for the integration doc.
4. Add install docs with an honest status label.
5. Run npm run validate, npm run smoke-test, npm pack --dry-run.
```

No feature code is written before the implementation plan is accepted.

## Verification

```bash
npm run validate
npm run smoke-test
npm pack --dry-run
```
