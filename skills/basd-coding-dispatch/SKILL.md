---
name: basd-coding-dispatch
description: Provider-neutral dispatch workflow for plan-first AI coding agents. Use when planning, implementing, reviewing, or coordinating AI-assisted coding work across Codex, Claude, split-provider, subagent, or generic agent workflows.
---

# basd-coding-dispatch

Use this skill to keep coding agents inside a disciplined workflow.

## Core Loop

1. Classify the request.
   - Identify whether it is a question, small fix, feature, refactor, debugging task, review, release task, or integration task.
   - Identify risk: user-facing behavior, security, data loss, public docs, dependency changes, or workflow changes.

2. Select the provider.
   - Choose one implementer when the task is narrow.
   - Split implementation and review when the task is risky or broad.
   - Keep provider mechanics in `references/` and `integrations/`.

3. Run the spec gate.
   - Produce a concise spec before code when requirements are ambiguous, user-facing, or broad.
   - Wait for approval when the user asked for gates or when the scope is not clear.

4. Run the implementation-plan gate.
   - Name files, behavior, tests, verification commands, and rollback considerations.
   - Do not write feature code before the plan is approved when plan approval is required.

5. Implement.
   - Keep changes scoped to the approved plan.
   - Preserve unrelated user changes.
   - Avoid provider lock-in unless the integration requires it.

6. Review independently.
   - Use a separate reviewer or subagent when available for meaningful changes.
   - Reconcile findings before final verification.

7. Verify before completion.
   - Run the smallest commands that prove the work, then broader checks when risk justifies them.
   - Report commands, status, skipped checks, and residual risk.

## References

Load only the reference needed for the task:

- `references/quality-gates.md` for gate criteria.
- `references/provider-command-recipes.md` for provider-neutral command patterns.
- `references/session-topology.md` for single-provider and split-provider shapes.
- `references/review-orchestration.md` for independent review.
- `references/subagent-skill-bundles.md` for assigning focused subagent work.
