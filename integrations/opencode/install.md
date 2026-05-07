# OpenCode Install

Status: experimental

The OpenCode target currently installs provider-neutral files only. Native extension metadata is planned only after the install path can be validated locally.

## Install

```bash
npx basd-coding-dispatch init --target opencode --dir <project>
```

## Expected Files

- `AGENTS.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `references/*.md`
- `integrations/opencode/install.md`

## Usage

Use the copied files as explicit session instructions. Record any OpenCode-specific command behavior in project docs rather than the portable skill.
