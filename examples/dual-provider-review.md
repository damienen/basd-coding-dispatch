# Dual Worker Review Example

Reference files: `references/review-orchestration.md`, `references/review-packets.md`, `references/session-topology.md`

## Request

Implement a release workflow skeleton and make sure it cannot publish unless the package token is configured.

## Classification

Release and packaging task. Higher risk because incorrect claims or unsafe publish behavior can affect public packages.

## Worker Routing

Worker A implements the workflow. Worker B reviews the diff and checks whether the workflow is safe, conventional, and honest.

Use `subagent-driven-development` if implementation has 3+ owned task slices. Use `dispatching-parallel-agents` only for independent domains, such as read-only docs claim review while workflow edits continue elsewhere.

## Implementer Brief

```text
Create a tag-based release workflow.
Run CI-like checks.
Publish only when the npm package token is configured.
Do not publish during implementation.
Do not create a release.
```

## Reviewer Brief

```text
Review the workflow for unsafe publish behavior, fake release claims, missing checks, and credential exposure.
Findings first. Include file and line references when possible. Use this markdown/YAML format when practical:

verdict: APPROVE | REQUEST_CHANGES
risk: risky
findings:
  - id: R1
    severity: blocker | high | medium | low | bonus
    category: correctness | edge-case | tests | security | maintainability | scope | docs
    file: path or n/a
    evidence: short concrete evidence
    recommendation: short fix or backlog note
    disposition: must-fix-now | ask-human | bonus-backlog | reject-if-wrong
```

## Review Intake

Before any fix loop, use `receiving-code-review`:

1. Read the complete feedback.
2. Restate unclear findings.
3. Verify each finding against the workflow, package scripts, and approved scope.
4. Evaluate whether the finding is technically sound.
5. Disposition it as `must-fix-now`, `ask-human`, `bonus-backlog`, or `reject-if-wrong`.
6. Fix only accepted in-scope findings.

## Dispatcher Reconciliation

The dispatcher accepts concrete findings, rejects incorrect findings with evidence, preserves valid out-of-scope bonus findings as backlog/input, applies narrow in-scope fixes, and reruns:

```bash
npm run validate
npm run smoke-test
npm run workflow-evals
npm pack --dry-run
```
