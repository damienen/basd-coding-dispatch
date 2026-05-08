# Hermes Install

Status: tested

Hermes is the maintained home for v0.1. This target installs the complete `basd-coding-dispatch` skill directory into the Hermes skills directory, including `SKILL.md` and skill-local `references/` files.

By default, the installer also installs pinned companion skills from `integrations/companion-skills.json` when they are missing. These include Hermes Codex/Claude Code worker guides and Superpowers process skills for planning, review, TDD, debugging, and verification. Default companion installs fetch from `raw.githubusercontent.com`, so they require network access to GitHub raw content.

## Install

```bash
npx basd-coding-dispatch init
```

To install only `basd-coding-dispatch` and skip companion skills for the offline/core-only path:

```bash
npx basd-coding-dispatch init --skip-companion-skills
npx basd-coding-dispatch init --no-companion-skills
```

Destination resolution:

- `--dir <path>` treats `<path>` as the Hermes home root and installs under `<path>/skills/basd-coding-dispatch/`.
- Without `--dir`, `$HERMES_HOME` is used when set.
- Without `--dir` or `$HERMES_HOME`, the default is `~/.hermes/skills/basd-coding-dispatch/`.

## Expected Skill Files

- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `skills/basd-coding-dispatch/references/quality-gates.md`
- `skills/basd-coding-dispatch/references/provider-command-recipes.md`
- `skills/basd-coding-dispatch/references/session-topology.md`
- `skills/basd-coding-dispatch/references/review-orchestration.md`
- `skills/basd-coding-dispatch/references/subagent-skill-bundles.md`

Default companion skills install under sibling directories such as `skills/codex/`, `skills/claude-code/`, and `skills/using-superpowers/`. Existing companion skills are skipped unless `--force` is provided.

The installer refuses to overwrite existing core `basd-coding-dispatch` skill files without `--force`.

## Use From Hermes

After install, check discovery with:

```bash
hermes skills list
```

Then start a session with the skill, for example:

```text
/skill basd-coding-dispatch
```

Use Telegram or another mobile chat surface as the control plane, then let Hermes route approved implementation work to Codex, Claude, or another validated worker backend.
