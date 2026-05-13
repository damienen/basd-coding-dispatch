# Skill References

Hermes and OpenClaw install the full `skills/basd-coding-dispatch/` directory. These reference files are skill-local so an installed skill can work without reaching back into the repository root.

Suggested loading order:

1. Start with `skills/basd-coding-dispatch/SKILL.md`.
2. Load `references/quality-gates.md` for classification, spec, plan, review, and verification gates.
3. Load `references/quality-profiles.md` for risk-tiered default gates, review levels, tests, and auto-escalation.
4. Load `references/edge-case-packs.md` for short recurring-miss checklists.
5. Load `references/plan-linter.md` as a human checklist before approving feature, risky, public, cross-module, or ambiguous plans.
6. Load `references/review-packets.md` before asking for independent review.
7. Load `references/review-orchestration.md` when meaningful implementation work needs independent review.
8. Load `references/superpowers-integration.md` when Superpowers skills are part of the dispatch evidence.
9. Load `references/prompt-templates.md` for reusable dispatch, review, and final-report prompts.
10. Load `references/provider-command-recipes.md` for Hermes/OpenClaw installs and worker command shapes.
11. Load `references/session-topology.md` for mobile dispatch, single-worker, split-worker, and subagent sessions.
12. Load `references/subagent-skill-bundles.md` when assigning bounded worker tasks.

Tiny fixes still receive lightweight independent review. A2 run manifest / gate ledger is intentionally not part of v0.1 public requirements.
