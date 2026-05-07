# Codex CLI Install

Status: experimental

The file scaffold is tested by the package smoke test. Native Codex plugin metadata is not included in v0.1 because this repo only validates the portable file-based workflow.

## Install

```bash
npx basd-coding-dispatch init --target codex --dir <project>
```

## Expected Files

- `AGENTS.md`
- `llms.txt`
- `skills/basd-coding-dispatch/SKILL.md`
- `skills/basd-coding-dispatch/references/README.md`
- `references/*.md`
- `integrations/codex/install.md`

## Usage

Ask Codex to use the copied skill and references for plan-first dispatch. Keep local project instructions in `AGENTS.md` and avoid changing provider-neutral references unless the improvement belongs upstream.
