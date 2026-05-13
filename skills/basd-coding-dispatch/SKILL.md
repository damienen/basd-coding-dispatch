---
name: basd-coding-dispatch
description: Hermes/OpenClaw-first dispatch workflow for approval-gated AI coding from Telegram and mobile chat. Use when planning, implementing, reviewing, or coordinating Codex, Claude, split-worker, subagent, or generic agent workflows.
---

# basd-coding-dispatch

Use this skill to keep mobile-controlled coding work inside a disciplined Hermes/OpenClaw workflow.

The dispatcher owns the gates. Codex, Claude, and other validated tools are worker backends selected by routing policy, not the center of the workflow.

## Core Loop

1. Classify the request.
   - Identify whether it is a question, small fix, feature, refactor, debugging task, review, release task, or integration task.
   - Identify risk: user-facing behavior, security, data loss, public docs, dependency changes, or workflow changes.
   - Select the quality profile and edge-case pack. Tiny fixes still receive lightweight independent review.

2. Select the worker-routing shape.
   - Choose one implementer when the task is narrow.
   - Split implementation and review when the task is risky or broad.
   - Keep provider mechanics in `references/` and integration docs.

3. Run the spec gate.
   - Produce a concise spec before code when requirements are ambiguous, user-facing, or broad.
   - Wait for approval when the user asked for gates or when the scope is not clear.

4. Run the implementation-plan gate.
   - Name files, behavior, tests, verification commands, and rollback considerations.
   - Do not write feature code before the plan is approved when plan approval is required.
   - Use `references/plan-linter.md` as a human checklist for feature, risky, public, cross-module, or ambiguous work.

5. Implement.
   - Keep changes scoped to the approved plan.
   - Preserve unrelated user changes.
   - Avoid worker lock-in unless the integration requires it.

6. Review independently.
   - Use a separate reviewer or subagent when available for meaningful changes.
   - Use lightweight independent review even for tiny fixes.
   - Build the reviewer packet from `references/review-packets.md`.
   - Reconcile findings before final verification.
   - Preserve valid bonus findings as backlog/input instead of discarding them.

7. Verify before completion.
   - Run the smallest commands that prove the work, then broader checks when risk justifies them.
   - Include Superpowers evidence, or explicit compensation with external gates when a required skill/reference was unavailable.
   - Report commands, status, skipped checks, and residual risk.

A2 run manifest / gate ledger is intentionally not part of the v0.1 public skill requirements.

## References

Load only the reference needed for the task:

- `references/quality-gates.md` for gate criteria.
- `references/quality-profiles.md` for risk-tiered defaults, review levels, and test escalation.
- `references/edge-case-packs.md` for short recurring-miss checklists.
- `references/review-packets.md` for independent-review inputs.
- `references/superpowers-integration.md` for Superpowers evidence and compensation.
- `references/prompt-templates.md` for dispatch, review, and final-report prompt shapes.
- `references/plan-linter.md` for implementation-plan checklisting.
- `references/provider-command-recipes.md` for Hermes/OpenClaw install and worker command patterns.
- `references/session-topology.md` for single-worker and split-worker shapes.
- `references/review-orchestration.md` for independent review.
- `references/subagent-skill-bundles.md` for assigning focused subagent work.
