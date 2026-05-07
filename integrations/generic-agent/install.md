# Generic Agent Install

Status: tested

The generic target is a file-based scaffold for agents that can read project instructions and Markdown skills. The package smoke test verifies that the files are created and overwrite protection works.

## Install

```bash
npx basd-coding-dispatch init --target generic-agent --dir <project>
```

## Expected Files

- `AGENTS.md`
- `CLAUDE.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `references/*.md`
- `integrations/generic-agent/install.md`

## Usage

Tell the agent to read `AGENTS.md`, then use `skills/basd-coding-dispatch/SKILL.md` for the dispatch loop. Load references only as needed.
