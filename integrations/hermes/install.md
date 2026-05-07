# Hermes Install

Status: experimental

This target provides a manual file scaffold for Hermes-style agent dispatch. Native marketplace or plugin metadata is not included in v0.1 because the install path has not been validated in this repo.

## Install

```bash
npx basd-coding-dispatch init --target hermes --dir <project>
```

## Expected Files

- `AGENTS.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `references/*.md`
- `integrations/hermes/install.md`

## Adaptation Notes

Point the harness at the copied governance and skill files. Keep provider commands outside the portable skill and document any local harness behavior in project-specific docs.
