# Claude Code Install

Status: experimental

The v0.1 integration is a manual scaffold. Native Claude Code marketplace or plugin metadata is not included because this repo has not validated that path.

## Install

```bash
npx basd-coding-dispatch init --target claude-code --dir <project>
```

## Expected Files

- `CLAUDE.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `references/*.md`
- `integrations/claude-code/install.md`

## Usage

Keep `CLAUDE.md` strict and short. Load the public skill for workflow and the references only when the task needs provider selection, review orchestration, or quality gates.
