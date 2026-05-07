# Quality Gates

Quality gates keep AI coding work explicit enough for a human or another agent to evaluate.

## 1. Classification Gate

Every request should be classified before work starts:

- Question or explanation.
- Small fix.
- Feature build.
- Refactor.
- Debugging or incident investigation.
- Code review.
- Release or packaging task.
- Provider integration task.

The classification determines how much ceremony is needed.

## 2. Provider Gate

Choose the provider shape:

- Codex implements.
- Claude implements.
- One provider implements and another reviews.
- Dispatcher coordinates multiple subagents.
- Generic agent follows the portable skill.

Record the reason when the task is risky or split.

## 3. Spec Gate

Use a spec gate when a task is broad, ambiguous, user-facing, public, security-sensitive, or likely to change architecture.

A useful spec includes:

- Problem statement.
- Non-goals.
- User-visible behavior.
- Constraints.
- Acceptance criteria.

## 4. Implementation-Plan Gate

Use an implementation-plan gate before feature code. A useful plan names:

- Files to create or modify.
- Behavioral changes.
- Tests and validation commands.
- Review strategy.
- Rollback or recovery concerns.

## 5. Review Gate

Meaningful implementation work needs independent review. The reviewer should look for:

- Behavioral regressions.
- Missing tests.
- Unsafe provider assumptions.
- Docs that overclaim tested behavior.
- Private data or credential leakage.

## 6. Verification Gate

Completion requires concrete evidence:

- Commands and exit statuses.
- Test output.
- Manual transcript or example.
- Screenshots only when visual verification matters.
- Clear note for skipped checks.

Do not claim done when verification is missing.
