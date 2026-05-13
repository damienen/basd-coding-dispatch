# Plan-Lint Checklist

This is a human checklist for plan linting, not an executable or automated linter. Run it before approving implementation plans for feature, risky, broad, cross-module, public, or ambiguous work.

## Checklist

- Request classification and selected quality profile are explicit.
- Provider or provider split is named.
- Spec gate is approved or clearly not required.
- Brainstorming artifact or explicit reason it was not required is present.
- Exact files to create, modify, or delete are listed.
- Behavioral changes and non-goals are listed.
- TDD applicability statement is present, with tests and expected RED failures named where TDD applies.
- Debugging and root-cause evidence is included for bugfixes.
- Isolation or worktree plan is named for feature work.
- Execution mode is named: `executing-plans`, `subagent-driven-development`, or `dispatching-parallel-agents`.
- Edge-case pack is selected and adapted to the task.
- Review packet contents are listed, including untracked files.
- Review-intake policy is listed for handling findings before fix loops.
- Verification commands and expected evidence are listed.
- Branch closeout plan and forbidden side effects are named.
- Rollback or recovery path is named.
- Required skill bundles or references are named.
- Diff hygiene and leakage checks are included for public repo work.
- Excluded scope is listed, especially provider validation, snapshot commands, auto reviewer orchestration, strict JSON reviewer output, or run manifest requirements when excluded.
- No implementation starts before plan approval when the gate is required.

## Reject Or Revise When

- The plan hides implementation behind vague phrases like "update docs" or "fix tests" without file paths.
- The plan invents requirements that should have been settled by spec or brainstorming.
- The test plan cannot prove the behavioral claim.
- TDD applies but no expected RED failure is named.
- Review is missing for implementation work.
- Review intake is missing when reviewer findings are expected.
- Public docs would claim unvalidated provider support.
- The plan introduces a required run manifest or gate ledger when that artifact is out of scope.
