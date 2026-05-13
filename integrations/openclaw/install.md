# OpenClaw Install

Status: tested

OpenClaw users can run the same dispatch workflow as a workspace skill. Local evidence for v0.1 verifies OpenClaw 2026.5.2 against the workspace-skill layout under `~/openclaw-workspace/skills/...`.

Hermes remains the maintained home. OpenClaw support is documented as workspace-skill compatible, not as a marketplace, plugin, or ClawHub package. After installing, verify discovery on your local OpenClaw runtime with `openclaw skills list` and `openclaw skills info basd-coding-dispatch`.

By default, the installer also installs pinned companion skills from `integrations/companion-skills.json` when they are missing. These include Hermes Codex/Claude Code worker guides and complete pinned upstream directories for all 14 Superpowers process skills: activation, brainstorming, worktrees, planning, execution, parallel dispatch, review request, review intake, TDD, systematic debugging, verification, branch closeout, and skill-writing. Default companion installs fetch from `raw.githubusercontent.com`, so they require network access to GitHub raw content.

## Install

```bash
npx basd-coding-dispatch init --target openclaw
```

To install only `basd-coding-dispatch` and skip companion skills for the offline/core-only path:

```bash
npx basd-coding-dispatch init --target openclaw --skip-companion-skills
npx basd-coding-dispatch init --target openclaw --no-companion-skills
```

Destination resolution:

- `--dir <path>` treats `<path>` as the OpenClaw workspace root and writes under `<path>/skills/`.
- Without `--dir`, `$OPENCLAW_WORKSPACE` is used when set.
- Without `--dir` or `$OPENCLAW_WORKSPACE`, the default is `~/openclaw-workspace/skills/basd-coding-dispatch/`.

Runtime discovery depends on the workspace that OpenClaw is actually using. If `openclaw skills list` does not show the skill, check the active OpenClaw workspace path before reinstalling.

## Expected Skill Files

- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `skills/basd-coding-dispatch/references/quality-gates.md`
- `skills/basd-coding-dispatch/references/provider-command-recipes.md`
- `skills/basd-coding-dispatch/references/session-topology.md`
- `skills/basd-coding-dispatch/references/review-orchestration.md`
- `skills/basd-coding-dispatch/references/subagent-skill-bundles.md`

Default companion skills install under sibling directories such as `skills/codex/`, `skills/claude-code/`, `skills/using-superpowers/`, `skills/brainstorming/`, and `skills/finishing-a-development-branch/`. Existing companion skills are skipped unless `--force` is provided.

The installer refuses to overwrite existing core `basd-coding-dispatch` skill files without `--force`.

## Use From OpenClaw

Check skill discovery with:

```bash
openclaw skills list
openclaw skills info basd-coding-dispatch
```

Then start a session with the skill, for example:

```text
/skill basd-coding-dispatch
```
