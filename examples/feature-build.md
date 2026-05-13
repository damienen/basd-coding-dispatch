# Feature Build Example

Reference files: `references/quality-gates.md`, `references/quality-profiles.md`, `references/edge-case-packs.md`, `references/plan-linter.md`, `references/session-topology.md`

## Request

Add a new worker adapter target for a coding harness.

## Classification

Feature build using the `cli-package` quality profile and CLI/tooling/package edge-case pack. It changes installer behavior, docs, validation, examples, and public claims.

## Brainstorming Gate

```text
Goal: provide a scaffold target for the harness without implying native marketplace support.
Non-goals: no hidden metadata, no credential handling, no publish/release action.
Approaches:
- Manual scaffold only: lower risk, honest status, covered by smoke tests.
- Native adapter claim: rejected until install path is validated.
Acceptance: init supports --target <new-target>, copies only validated public files, refuses overwrite without --force, docs include tested/experimental status.
Decision: proceed with manual or experimental adapter only, then write an implementation plan.
```

No implementation plan is written before this brainstorming/spec direction is accepted.

## Spec Gate

```text
Problem: users need a scaffold target for the harness.
Non-goals: no native marketplace package, no hidden metadata, no credential handling.
Behavior: init supports --target <new-target>, copies only validated public files, refuses overwrite without --force.
Docs: integration page includes status label and tested scope.
Acceptance: validate, smoke-test, workflow-evals, and pack dry-run pass.
```

No code is written before the spec gate is accepted.

## Implementation Plan Only

```text
Files:
- bin/basd-coding-dispatch.mjs
- scripts/validate.mjs
- scripts/smoke-test.mjs
- integrations/<new-target>/install.md
- README.md

Steps:
1. Add failing smoke-test coverage for the new target.
2. Run the plan linter and confirm exact files, expected RED failure, edge-case pack, review packet, rollback, and verification commands are named.
3. Add the target to CLI target maps.
4. Add validation coverage for the integration doc.
5. Add install docs with an honest status label.
6. Escalate tests if package files, force/overwrite behavior, JSON/text output, or public support claims change.
7. Execute with subagent-driven-development if the work splits into 3+ owned task slices; use executing-plans if it stays at 1-2 tasks.
8. Run review intake for accepted findings, then final verification.
```

No feature code is written before the implementation plan is accepted.

## Verification

```bash
npm run validate
npm run smoke-test
npm run workflow-evals
npm pack --dry-run
```
