# Quality Gates

Quality gates keep AI coding work explicit enough for a human or another agent to evaluate.

Use the smallest gate set that protects the work. `references/quality-profiles.md` provides defaults, and the dispatcher may auto-escalate when it sees risk that the initial request did not name.

## 1. Classification Gate

Every request should be classified before work starts:

- Question or explanation.
- Tiny fix.
- Feature build.
- Refactor.
- Debugging or incident investigation.
- Code review.
- Release or packaging task.
- Provider integration task.

The classification determines the default quality profile, edge-case pack, review level, tests, and Superpowers activation map. Tiny fixes are still reviewed independently; the review can be lightweight, but it is not skipped.

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

## 4. Brainstorming Gate

The Brainstorming Gate runs before the Implementation-Plan Gate for broad, ambiguous, user-facing, UI/design, architecture, workflow, public-doc, or public-claim work. Use it to explore approaches and settle requirements before planning files and tests.

Full brainstorming should cover goal, non-goals, tradeoffs, acceptance criteria, open questions, and the decision that implementation planning will follow.

For an exact low-risk `tiny-fix`, use a micro-brainstorm only when ambiguity, conflicting behavior, or user-visible tradeoffs appear. Use a micro-brainstorm for tiny-fix scope only when the small request is unclear. Otherwise record that the stated behavior is exact enough and keep the fix lightweight.

The implementation plan must not become the first place requirements are invented.

## 5. Implementation-Plan Gate

Use an implementation-plan gate before feature code. A useful plan names:

- Files to create or modify.
- Behavioral changes.
- Tests and validation commands.
- TDD applicability and expected RED failures when behavior changes.
- Execution mode: `executing-plans`, `subagent-driven-development`, or `dispatching-parallel-agents`.
- Review strategy and review-intake policy.
- Rollback or recovery concerns.
- Branch closeout option boundaries.

Run the human plan-lint checklist in `references/plan-linter.md` for feature, risky, public, cross-module, or ambiguous work. Plans should name expected RED failures when TDD applies.

## 6. Debugging Gate

For bugfixes and incidents, use systematic debugging before changing code:

- Capture the symptom.
- Reproduce or identify the failing check.
- Find root cause.
- Fix the narrow cause.
- Verify the original symptom and relevant regressions.

## 7. Review Gate

Meaningful implementation work needs independent review. The reviewer should look for:

- Behavioral regressions.
- Missing tests.
- Unsafe worker or provider assumptions.
- Docs that overclaim tested behavior.
- Private data or credential leakage.

Use `references/review-packets.md` to build the packet. Review output should follow `references/review-orchestration.md`: concrete findings first, with bonus findings preserved as backlog/input instead of being discarded.

Before fix loops, run review intake with `receiving-code-review`: read, restate, verify, evaluate, disposition, then fix only accepted in-scope findings. Reject wrong findings with evidence.

After implementation-plan approval, narrow in-scope review findings may be fixed in flow. Ask the human before broad refactors, new gates outside the approved plan, provider adapter validation, snapshot commands, or auto reviewer orchestration.

## 8. Verification Gate

Completion requires concrete evidence:

- Commands and exit statuses.
- Test output.
- Manual transcript or example.
- Screenshots only when visual verification matters.
- Clear note for skipped checks.

Do not claim done when verification is missing.

## 9. Branch Closeout Gate

After verification, use explicit closeout options. `finishing-a-development-branch` should present keep-local, push/PR, merge, or discard-style choices as allowed by the human's branch policy. Do not push, publish, release, deploy, merge, delete branches, or open a PR unless explicitly approved.

## v0.1 Non-Requirement

A2 run manifest / gate ledger is excluded from v0.1 and is not required as a new artifact. Existing private or project-specific manifest practices can continue where already established, but this public skill does not introduce a required gate ledger.
