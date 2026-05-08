# Cursor Install

Status: experimental

The Cursor target is a future/manual adapter scaffold. Cursor-specific rule or extension metadata is not included in v0.1 because this repo has not validated a native install path.

## Install

```bash
npx basd-coding-dispatch init --target cursor --dir <project>
```

## Expected Files

- `AGENTS.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `skills/basd-coding-dispatch/references/*.md`
- `references/*.md`
- `integrations/cursor/install.md`

## Usage

Reference `AGENTS.md` and the skill in Cursor chat or project instructions. Keep any editor-specific behavior separate from the Hermes/OpenClaw dispatch process until a native adapter is validated.
