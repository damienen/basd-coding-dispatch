# Skill References

Hermes and OpenClaw install the full `skills/basd-coding-dispatch/` directory. These reference files are skill-local so an installed skill can work without reaching back into the repository root.

Suggested loading order:

1. Start with `skills/basd-coding-dispatch/SKILL.md`.
2. Load `references/quality-gates.md` for classification, spec, plan, review, and verification gates.
3. Load `references/provider-command-recipes.md` for Hermes/OpenClaw installs and worker command shapes.
4. Load `references/session-topology.md` for mobile dispatch, single-worker, split-worker, and subagent sessions.
5. Load `references/review-orchestration.md` when meaningful implementation work needs independent review.
6. Load `references/subagent-skill-bundles.md` when assigning bounded worker tasks.
