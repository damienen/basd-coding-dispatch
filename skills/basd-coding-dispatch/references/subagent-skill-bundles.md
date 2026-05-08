# Subagent Skill Bundles

Use focused bundles so subagents do not duplicate work.

## Implementation Worker

Use for bounded file ownership:

- Inputs: spec, implementation plan, owned files, verification command.
- Output: changed files, verification result, risk.
- Rule: do not edit files outside ownership without dispatcher approval.

## Review Worker

Use for independent review:

- Inputs: spec, plan, diff, verification commands.
- Output: ordered findings with file and line references where possible.
- Rule: findings first, summary second.

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
