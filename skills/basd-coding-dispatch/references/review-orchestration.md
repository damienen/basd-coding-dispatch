# Review Orchestration

Independent review is useful only when the reviewer has a clear job and enough evidence.

Use `references/review-packets.md` to assemble the packet before asking for review.

## Reviewer Brief

Give the reviewer:

- The approved spec.
- The approved implementation plan.
- The diff or changed file list.
- Expected verification commands.
- Known constraints and non-goals.
- Untracked files, generated files, and skipped checks.

Do not give the reviewer a desired conclusion.

## Preferred Reviewer Output

Ask for this markdown/YAML structure. It is a preferred shape, not brittle JSON; the dispatcher can normalize imperfect but usable reviewer output when findings include concrete evidence.

```yaml
verdict: APPROVE | REQUEST_CHANGES
risk: tiny | standard | risky
findings:
  - id: R1
    severity: blocker | high | medium | low | bonus
    category: correctness | edge-case | tests | security | maintainability | scope | docs
    file: path or n/a
    evidence: short concrete evidence
    recommendation: short fix or backlog note
    disposition: must-fix-now | ask-human | bonus-backlog | reject-if-wrong
```

## Review Checklist

Ask for findings first:

- Correctness bugs.
- Regressions.
- Missing tests or insufficient verification.
- Worker-specific assumptions that should be documented.
- Public docs that overclaim tested behavior.
- Private data or credential leakage.

## Dispatcher Reconciliation

The dispatcher should:

1. Accept findings that are concrete and reproducible.
2. Reject findings that contradict the approved scope, with a short reason.
3. Preserve valid out-of-scope bonus findings as backlog/input instead of throwing them away.
4. Apply narrow in-scope fixes after implementation-plan approval.
5. Ask the human before broad refactors, new provider validation, snapshot commands, or auto reviewer orchestration.
6. Re-run verification.
7. Report remaining risk.
