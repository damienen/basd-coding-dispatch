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

5. Implement.
   - Keep changes scoped to the approved plan.
   - Preserve unrelated user changes.
   - Avoid worker lock-in unless the integration requires it.

6. Review independently.
   - Use a separate reviewer or subagent when available for meaningful changes.
   - Reconcile findings before final verification.

7. Verify before completion.
   - Run the smallest commands that prove the work, then broader checks when risk justifies them.
   - Report commands, status, skipped checks, and residual risk.

## References

Load only the reference needed for the task:

- `references/quality-gates.md` for gate criteria.
- `references/provider-command-recipes.md` for Hermes/OpenClaw install and worker command patterns.
- `references/session-topology.md` for single-worker and split-worker shapes.
- `references/review-orchestration.md` for independent review.
- `references/subagent-skill-bundles.md` for assigning focused subagent work.
