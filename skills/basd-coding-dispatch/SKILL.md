---
name: basd-coding-dispatch
description: Hermes/OpenClaw-first dispatch workflow for approval-gated AI coding from Telegram and mobile chat. Use when planning, implementing, reviewing, or coordinating Codex, Claude, split-worker, subagent, or generic agent workflows.
---

# basd-coding-dispatch

Use this skill to keep mobile-controlled coding work inside a disciplined Hermes/OpenClaw workflow.

The dispatcher owns the gates. Codex, Claude, and other validated tools are worker backends selected by routing policy, not the center of the workflow.

## Core Loop

1. Classify the request.
   - Identify whether it is a question, tiny fix, feature, refactor, debugging task, review, release task, or integration task.
   - Identify risk: user-facing behavior, security, data loss, public docs, dependency changes, install paths, workflow changes, or provider claims.
   - Select the quality profile and edge-case pack. Tiny fixes still receive lightweight independent review.

2. Load or declare the Superpowers activation map.
   - Start with `using-superpowers` when available.
   - Map the work to the relevant phases: `brainstorming`, `using-git-worktrees`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `test-driven-development`, `systematic-debugging`, `requesting-code-review`, `receiving-code-review`, `verification-before-completion`, `finishing-a-development-branch`, and `writing-skills`.
   - If a required skill/reference is unavailable, state the compensation gates instead of implying it loaded.

3. Select the worker-routing shape.
   - Choose one implementer when the task is narrow.
   - Split implementation and review when the task is risky or broad.
   - Use `executing-plans` for 1-2 approved tasks, `subagent-driven-development` for 3+ owned task slices, and `dispatching-parallel-agents` only for independent domains.
   - Keep provider mechanics in `references/` and integration docs.

4. Run the Brainstorming Gate when required.
   - Use it before implementation planning for broad, ambiguous, user-facing, UI/design, architecture, workflow, public-doc, or public-claim work.
   - Exact low-risk tiny fixes stay compact; use a micro-brainstorm only when ambiguity exists.
   - Do not let the implementation plan become the first place requirements are invented.

5. Run the spec gate when required.
   - Produce a concise spec before code when requirements are ambiguous, user-facing, broad, public, or risky.
   - Wait for approval when the user asked for gates or when the scope is not clear.

6. Run the implementation-plan gate.
   - Name files, behavior, TDD applicability, expected RED failures, execution mode, review packet, review-intake policy, verification commands, rollback, and branch closeout boundaries.
   - Do not write feature code before the plan is approved when plan approval is required.
   - Use `references/plan-linter.md` as a human checklist for feature, risky, public, cross-module, or ambiguous work.

7. Isolate and implement.
   - Use a worktree after implementation-plan approval when feature work needs isolation.
   - Keep changes scoped to the approved plan.
   - Preserve unrelated user changes.
   - Avoid worker lock-in unless the integration requires it.

8. Review independently and run review intake.
   - Use a separate reviewer or subagent when available for meaningful changes.
   - Use lightweight independent review even for tiny fixes.
   - Build the reviewer packet from `references/review-packets.md`.
   - Reconcile findings with `receiving-code-review`: read, restate, verify, evaluate, disposition, then fix only accepted in-scope findings.
   - Preserve valid bonus findings as backlog/input instead of discarding them.

9. Verify before completion.
   - Run the smallest commands that prove the work, then broader checks when risk justifies them.
   - Include Superpowers evidence, or explicit compensation with external gates when a required skill/reference was unavailable.
   - Report commands, status, skipped checks, and residual risk.

10. Finish the branch explicitly.
   - Use `finishing-a-development-branch` after verification to present closeout options.
   - Do not push, PR, merge, publish, release, deploy, delete branches, or discard work unless the human explicitly approves.
   - Update skills or process memory with `writing-skills` discipline only when useful and in scope.

A2 run manifest / gate ledger is intentionally not part of the v0.1 public skill requirements.

## References

Load only the reference needed for the task:

- `references/quality-gates.md` for gate criteria.
- `references/quality-profiles.md` for risk-tiered defaults, review levels, and test escalation.
- `references/edge-case-packs.md` for short recurring-miss checklists.
- `references/review-packets.md` for independent-review inputs.
- `references/superpowers-integration.md` for Superpowers phase map, evidence, and compensation.
- `references/prompt-templates.md` for dispatch, review, review-intake, closeout, and final-report prompt shapes.
- `references/plan-linter.md` for implementation-plan checklisting.
- `references/provider-command-recipes.md` for Hermes/OpenClaw install and worker command patterns.
- `references/session-topology.md` for single-worker, split-worker, and subagent execution shapes.
- `references/review-orchestration.md` for independent review and review intake.
- `references/subagent-skill-bundles.md` for assigning focused subagent work.
- `references/progressive-disclosure.md` when adapting the skill to private installs or keeping a large internal skill lean.
