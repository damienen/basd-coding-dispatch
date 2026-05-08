# OpenClaw Install

Status: tested

OpenClaw users can run the same dispatch workflow as a workspace skill. Local evidence for v0.1 verifies OpenClaw 2026.5.2 against the workspace-skill layout under `~/openclaw-workspace/skills/...`.

Hermes remains the maintained home. OpenClaw support is documented as workspace-skill compatible, not as a marketplace, plugin, or ClawHub package. After installing, verify discovery on your local OpenClaw runtime with `openclaw skills list` and `openclaw skills info basd-coding-dispatch`.

## Install

```bash
npx basd-coding-dispatch init --target openclaw
```

Destination resolution:

- `--dir <path>` treats `<path>` as the OpenClaw workspace root and installs under `<path>/skills/basd-coding-dispatch/`.
- Without `--dir`, `$OPENCLAW_WORKSPACE` is used when set.
- Without `--dir` or `$OPENCLAW_WORKSPACE`, the default is `~/openclaw-workspace/skills/basd-coding-dispatch/`.

## Expected Skill Files

- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `skills/basd-coding-dispatch/references/quality-gates.md`
- `skills/basd-coding-dispatch/references/provider-command-recipes.md`
- `skills/basd-coding-dispatch/references/session-topology.md`
- `skills/basd-coding-dispatch/references/review-orchestration.md`
- `skills/basd-coding-dispatch/references/subagent-skill-bundles.md`

The installer refuses to overwrite existing skill files without `--force`.

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
