# Review Orchestration

Independent review is useful only when the reviewer has a clear job and enough evidence.

## Reviewer Brief

Give the reviewer:

- The approved spec.
- The approved implementation plan.
- The diff or changed file list.
- Expected verification commands.
- Known constraints and non-goals.

Do not give the reviewer a desired conclusion.

## Review Checklist

Ask for findings first:

- Correctness bugs.
- Regressions.
- Missing tests or insufficient verification.
- Provider-specific assumptions that should be documented.
- Public docs that overclaim tested behavior.
- Private data or credential leakage.

## Dispatcher Reconciliation

The dispatcher should:

1. Accept findings that are concrete and reproducible.
2. Reject findings that contradict the approved scope, with a short reason.
3. Apply fixes.
4. Re-run verification.
5. Report remaining risk.
