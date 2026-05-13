# Superpowers Integration

When Superpowers skills are part of the workflow, the final report needs evidence that they were actually used. Naming a skill without loading or following it is not evidence. Superpowers evidence or compensation must be reported before completion.

## Evidence Contract

Record the relevant evidence:

- Skill names loaded for the task.
- Required checklist items or gates from those skills.
- How the implementation followed them.
- Verification commands that satisfy the skill's completion rule.
- Any skill/reference that was missing or unavailable.

## Compensation

If a required Superpowers skill or reference is missing, blocked, or unavailable, state the gap and compensate with external gates:

- Use the public quality profile and edge-case pack.
- Use an implementation-plan gate before feature code.
- Use independent review with a complete review packet.
- Run verification before completion.

Do not pretend a missing skill loaded. Report the compensation path explicitly.

## Auto-Fix Policy

After an implementation plan is approved, the dispatcher may fix narrow in-scope findings from tests or review without a second approval. Ask the human before broad refactors, new features, new provider validations, snapshot commands, auto reviewer orchestration, or changes outside the approved plan.
