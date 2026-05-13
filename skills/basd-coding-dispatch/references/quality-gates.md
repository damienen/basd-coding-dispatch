# Quality Gates

Quality gates keep AI coding work explicit enough for a human or another agent to evaluate.

Use the smallest gate set that protects the work. `references/quality-profiles.md` provides defaults, and the dispatcher may auto-escalate when it sees risk that the initial request did not name.

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

The classification determines the default quality profile, edge-case pack, review level, and tests. Tiny fixes are still reviewed independently; the review can be lightweight, but it is not skipped.

## 2. Worker-Routing Gate

Choose the worker shape:

- Hermes/OpenClaw dispatcher controls the gates.
- Codex implements.
- Claude implements.
- One worker implements and another reviews.
- Dispatcher coordinates multiple subagents.
- Generic agent follows the portable skill.

Record the reason when the task is risky or split.

## 3. Spec Gate

Use a spec gate when a task is broad, ambiguous, user-facing, public, security-sensitive, or likely to change architecture.

An ambiguous feature must pass through the spec gate before the implementation-plan gate. Do not let the implementation plan become the first place requirements are invented.

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

Run the human plan-lint checklist in `references/plan-linter.md` for feature, risky, public, cross-module, or ambiguous work. Plans should name expected RED failures when TDD applies.

## 5. Review Gate

Meaningful implementation work needs independent review. The reviewer should look for:

- Behavioral regressions.
- Missing tests.
- Unsafe worker or provider assumptions.
- Docs that overclaim tested behavior.
- Private data or credential leakage.

Use `references/review-packets.md` to build the packet. Review output should follow `references/review-orchestration.md`: concrete findings first, with bonus findings preserved as backlog/input instead of being discarded.

After implementation-plan approval, narrow in-scope review findings may be fixed in flow. Ask the human before broad refactors, new gates outside the approved plan, provider adapter validation, snapshot commands, or auto reviewer orchestration.

## 6. Verification Gate

Completion requires concrete evidence:

- Commands and exit statuses.
- Test output.
- Manual transcript or example.
- Screenshots only when visual verification matters.
- Clear note for skipped checks.

Do not claim done when verification is missing.

## v0.1 Non-Requirement

A2 run manifest / gate ledger is excluded from v0.1 and is not required as a new artifact. Existing private or project-specific manifest practices can continue where already established, but this public skill does not introduce a required gate ledger.
