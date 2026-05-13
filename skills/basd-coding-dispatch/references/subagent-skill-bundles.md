# Subagent Skill Bundles

Use focused bundles so subagents do not duplicate work, edit outside ownership, or skip the Superpowers phase map.

## Task Owner

Use for the dispatcher/coordinator:

- `using-superpowers`
- `brainstorming`
- `writing-plans`
- `subagent-driven-development`
- `dispatching-parallel-agents`
- `verification-before-completion`

Responsibilities: classify, run the Brainstorming Gate when required, write or enforce the approved plan, assign ownership, integrate results, and run final verification.

## Implementer

Use for bounded file ownership:

- `test-driven-development`
- `systematic-debugging` when the task is a bugfix
- `verification-before-completion`

Inputs: spec, implementation plan, owned files, verification command.

Output: changed files, verification result, risk.

Rules:

- Do not edit files outside ownership without dispatcher approval.
- Report Superpowers skills used, or state the compensation gates when a required skill/reference was unavailable.
- Preserve unrelated user changes.

## Spec Reviewer

Use for spec/plan compliance:

- `requesting-code-review`
- `receiving-code-review`
- `verification-before-completion`

Inputs: approved spec, implementation plan, diff, untracked files, constraints, and skipped checks.

Output: ordered findings with file and line references where possible.

## Quality Reviewer

Use for correctness, maintainability, and risk:

- `requesting-code-review`
- `receiving-code-review`
- `verification-before-completion`

Rules:

- Findings first, summary second.
- Use the markdown/YAML format in `references/review-orchestration.md` when practical.
- Preserve valid bonus findings as backlog/input.

## Closer

Use for branch and handoff decisions:

- `finishing-a-development-branch`

The closer verifies first, then presents explicit closeout options. It does not push, PR, merge, publish, release, deploy, delete branches, or discard work without approval.

## Process Updater

Use for reusable process and skill documentation:

- `writing-skills`

The process updater treats skill/process changes as testable workflow behavior and avoids private references in public package docs.

## Docs Worker

Use for public docs:

- Inputs: audience, files, tested status, banned claims.
- Output: concise docs that match verified behavior.
- Rule: never imply native marketplace support before validation.

## Integration Worker

Use for provider adaptation:

- Inputs: target tool, install mechanism, manual install attempt, validation evidence.
- Output: install notes and status label.
- Rule: mark uncertain native support as experimental or planned.
