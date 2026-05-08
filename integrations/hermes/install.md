# Hermes Install

Status: tested

Hermes is the maintained home for v0.1. This target installs the complete `basd-coding-dispatch` skill directory into the Hermes skills directory, including `SKILL.md` and skill-local `references/` files.

## Install

```bash
npx basd-coding-dispatch init
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

The installer refuses to overwrite existing skill files without `--force`.

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
