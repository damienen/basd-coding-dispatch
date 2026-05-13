# Skill References

Hermes and OpenClaw install the full `skills/basd-coding-dispatch/` directory. These reference files are skill-local so an installed skill can work without reaching back into the repository root.

Suggested loading order:

1. Start with `skills/basd-coding-dispatch/SKILL.md`.
2. Load `references/superpowers-integration.md` when Superpowers skills are part of the dispatch flow or evidence.
3. Load `references/quality-gates.md` for classification, Brainstorming Gate, spec, plan, debugging, review, verification, and closeout gates.
4. Load `references/quality-profiles.md` for risk-tiered default gates, review levels, tests, and auto-escalation.
5. Load `references/plan-linter.md` as a human checklist before approving feature, risky, public, cross-module, or ambiguous plans.
6. Load `references/prompt-templates.md` for Superpowers activation, dispatch, review intake, branch closeout, and final-report prompts.
7. Load `references/session-topology.md` for mobile dispatch, single-worker, split-worker, and subagent execution shapes.
8. Load `references/subagent-skill-bundles.md` when assigning bounded worker tasks.
9. Load `references/review-packets.md` before asking for independent review.
10. Load `references/review-orchestration.md` when meaningful implementation work needs independent review or review intake.
11. Load `references/edge-case-packs.md` for short recurring-miss checklists.
12. Load `references/provider-command-recipes.md` for Hermes/OpenClaw installs and worker command shapes.

Tiny fixes still receive lightweight independent review. A2 run manifest / gate ledger is intentionally not part of v0.1 public requirements.
