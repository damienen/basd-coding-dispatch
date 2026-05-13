# Plan-Lint Checklist

This is a human checklist for plan linting, not an executable or automated linter. Run it before approving implementation plans for feature, risky, broad, cross-module, public, or ambiguous work.

## Checklist

- Request classification and selected quality profile are explicit.
- Provider or provider split is named.
- Spec gate is approved or clearly not required.
- Exact files to create, modify, or delete are listed.
- Tests and expected RED failures are named where TDD applies.
- Edge-case pack is selected and adapted to the task.
- Review packet contents are listed, including untracked files.
- Verification commands and expected evidence are listed.
- Rollback or recovery path is named.
- Required skill bundles or references are named.
- Diff hygiene and leakage checks are included for public repo work.
- Excluded scope is listed, especially provider validation, snapshot commands, auto reviewer orchestration, or run manifest requirements when excluded.
- No implementation starts before plan approval when the gate is required.

## Reject Or Revise When

- The plan hides implementation behind vague phrases like "update docs" or "fix tests" without file paths.
- The test plan cannot prove the behavioral claim.
- Review is missing for implementation work.
- Public docs would claim unvalidated provider support.
- The plan introduces a required run manifest or gate ledger when that artifact is out of scope.
