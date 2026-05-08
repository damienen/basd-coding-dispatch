# Claude Code Install

Status: experimental

Claude Code is a supported worker backend for implementation and review. This target is an experimental manual adapter scaffold, not a native Claude Code marketplace or plugin install.

## Install

```bash
npx basd-coding-dispatch init --target claude-code --dir <project>
```

## Expected Files

- `CLAUDE.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `skills/basd-coding-dispatch/references/*.md`
- `references/*.md`
- `integrations/claude-code/install.md`

## Usage

Keep `CLAUDE.md` strict and short. Load the public skill for workflow and the references only when the task needs worker routing, review orchestration, or quality gates.
