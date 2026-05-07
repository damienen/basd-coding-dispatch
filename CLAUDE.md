# CLAUDE.md

## Anti-Slop Governance

This repo expects Claude Code sessions to follow the same dispatch gates as every other provider. A fast answer is not enough; the work must be classified, planned, reviewed, and verified.

## Workflow

1. Classify the user request.
2. Decide whether Claude should implement, review, or work in a split-provider flow.
3. Ask for a spec gate when requirements are unclear.
4. Ask for implementation-plan approval before feature code.
5. Implement only the approved scope.
6. Request independent review for meaningful code changes.
7. Run verification before final response.
8. Report what changed, what ran, what failed or was skipped, and what remains risky.

## Guardrails

- Keep provider-specific details in `integrations/` or `references/`.
- Keep `skills/basd-coding-dispatch/SKILL.md` lean and portable.
- Do not add credentials, private paths, private identifiers, or private project data.
- Do not claim native plugin support until it has been validated.
- Do not push, publish, release, or open a PR without explicit maintainer instruction.
