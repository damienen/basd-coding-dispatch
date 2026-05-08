# Codex CLI Install

Status: experimental

Codex is a supported worker backend for implementation and review. This target is an experimental manual adapter scaffold, not a native Codex plugin or marketplace install.

## Install

```bash
npx basd-coding-dispatch init --target codex --dir <project>
```

## Expected Files

- `AGENTS.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `skills/basd-coding-dispatch/references/*.md`
- `references/*.md`
- `integrations/codex/install.md`

## Usage

Ask Codex to use the copied skill and references for plan-first dispatch, or let Hermes/OpenClaw route approved worker tasks to Codex. Keep local project instructions in `AGENTS.md` and avoid changing shared references unless the improvement belongs upstream.
