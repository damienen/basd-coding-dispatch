# Prompt Templates

These templates are compact starting points. Fill in concrete file paths, tests, constraints, and excluded work before dispatching.

## Classification

```text
Classify the request as question, tiny-fix, standard-feature, risky-release, mobile-ui, backend-api, cli-package, public-docs, review, refactor, or debugging.
Name the provider or provider split.
Name the quality profile, edge-case pack, default gates, and auto-escalation triggers.
Do not implement yet.
```

## Superpowers Activation Map

```text
Superpowers Activation Map:
- using-superpowers: session start / skill applicability check.
- brainstorming: required before implementation planning for broad, ambiguous, user-facing, UI/design, architecture, workflow, public-doc, or public-claim work; micro-brainstorm only when tiny-fix ambiguity exists.
- using-git-worktrees: isolate feature work after implementation-plan approval.
- writing-plans: implementation-plan gate.
- executing-plans | subagent-driven-development | dispatching-parallel-agents: choose by task shape.
- test-driven-development: behavior change tests first where practical.
- systematic-debugging: bugfix and root-cause gate.
- requesting-code-review: independent review packet.
- receiving-code-review: review intake before fix loops.
- verification-before-completion: final evidence before completion claims.
- finishing-a-development-branch: closeout options only after verification.
- writing-skills: reusable skill/process changes.
```

## Brainstorming Gate

```text
Run a Brainstorming Gate only.
Cover goal, non-goals, candidate approaches, tradeoffs, acceptance criteria, open questions, required evidence, and the recommended direction.
Do not write an implementation plan until the brainstorming/spec direction is accepted.
For an exact low-risk tiny fix, state why full brainstorming is not required or provide a micro-brainstorm for the ambiguity.
```

## Spec Planning

```text
Produce a spec gate only.
Include problem, non-goals, user-visible behavior, constraints, acceptance criteria, risk profile, and skipped/excluded work.
Ask for approval before implementation planning.
```

## Implementation Plan Only

```text
Produce an implementation plan only.
Include exact files, expected behavior, brainstorming artifact or reason not required, TDD applicability, expected RED failures where applicable, edge-case pack, execution mode, review packet contents, review-intake policy, rollback, branch closeout boundaries, and verification commands.
Do not modify files before approval.
```

## Systematic Debugging Gate

```text
Debugging gate only.
Capture the symptom, reproduction or failing check, suspected scope, root-cause evidence, minimal fix direction, and verification commands.
Do not patch until root cause is identified or the investigation blocker is reported.
```

## Tiny-Fix Implementation

```text
Mode: approved tiny-fix implementation.
Use the tiny-fix quality profile.
Use a micro-brainstorm only if ambiguity exists.
Add or identify a focused failing check when practical, make the minimal change, run focused verification, request lightweight independent review, then report evidence.
```

## Standard Implementation

```text
Mode: approved implementation.
Follow the approved plan exactly.
Use the selected quality profile, edge-case pack, and Superpowers Activation Map.
Keep the diff scoped, include untracked files in review, fix narrow in-scope findings after review intake, and run final verification before reporting.
```

## Spec Reviewer

```text
Review this spec for ambiguity, missing non-goals, risk, acceptance criteria, edge cases, and provider/support overclaims.
Return findings first with concrete evidence.
```

## Quality Reviewer

```text
Review the diff against the approved spec and implementation plan.
Use the markdown/YAML reviewer format from references/review-orchestration.md.
Mark valid out-of-scope improvements as bonus-backlog, not blockers.
```

## Review Intake

```text
Use receiving-code-review.
Read the complete feedback, restate unclear requirements, verify each finding against the codebase, evaluate scope and correctness, disposition each item as must-fix-now, ask-human, bonus-backlog, or reject-if-wrong, then fix only accepted in-scope items.
Rerun the verification commands affected by each fix.
```

## Review-Fix Loop

```text
Triage each finding as must-fix-now, ask-human, bonus-backlog, or reject-if-wrong.
Fix only narrow in-scope items automatically.
Rerun the verification commands affected by each fix.
```

## Branch Closeout

```text
Use finishing-a-development-branch after verification.
Present explicit closeout options that respect the human's branch policy.
Do not push, create a PR, merge, publish, release, deploy, discard, or delete branches unless explicitly approved.
```

## Final Evidence Report

Use this Final verification report shape before claiming completion:

```text
Profile:
Provider/split:
Superpowers evidence or compensation:
Files changed:
Commands and exit statuses:
Independent review verdict:
Review-intake dispositions:
Fixed findings:
Skipped checks:
Remaining risks:
Branch closeout / no push-publish-PR-deploy status:
```
