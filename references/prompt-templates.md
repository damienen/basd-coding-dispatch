# Prompt Templates

These templates are compact starting points. Fill in concrete file paths, tests, constraints, and excluded work before dispatching.

## Classification

```text
Classify the request as question, tiny-fix, standard-feature, risky-release, mobile-ui, backend-api, cli-package, public-docs, review, refactor, or debugging.
Name the provider or provider split.
Name the quality profile, edge-case pack, default gates, and auto-escalation triggers.
Do not implement yet.
```

## Spec Planning

```text
Produce a spec gate only.
Include problem, non-goals, user-visible behavior, constraints, acceptance criteria, risk profile, and skipped/excluded work.
Ask for approval before implementation planning.
```

## Implementation-Plan-Only

```text
Produce an implementation plan only.
Include exact files, expected behavior, tests, expected RED failures where applicable, edge-case pack, review packet contents, rollback, and verification commands.
Do not modify files before approval.
```

## Tiny-Fix Implementation

```text
Mode: approved tiny-fix implementation.
Use the tiny-fix quality profile.
Add or identify a focused failing check when practical, make the minimal change, run focused verification, request lightweight independent review, then report evidence.
```

## Standard Implementation

```text
Mode: approved implementation.
Follow the approved plan exactly.
Use the selected quality profile and edge-case pack.
Keep the diff scoped, include untracked files in review, fix narrow in-scope findings, and run final verification before reporting.
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

## Review-Fix Loop

```text
Triage each finding as must-fix-now, ask-human, bonus-backlog, or reject-if-wrong.
Fix only narrow in-scope items automatically.
Rerun the verification commands affected by each fix.
```

## Final Verification Report

Use this Final verification report shape before claiming completion:

```text
Profile:
Provider/split:
Files changed:
Commands and exit statuses:
Independent review verdict:
Fixed findings:
Skipped checks:
Remaining risks:
No push/publish/PR/deploy status:
```
