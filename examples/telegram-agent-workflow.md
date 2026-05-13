# Telegram To Hermes Workflow Example

Reference files: `skills/basd-coding-dispatch/references/quality-gates.md`, `skills/basd-coding-dispatch/references/superpowers-integration.md`, `skills/basd-coding-dispatch/references/prompt-templates.md`, `integrations/hermes/install.md`

This is the flagship v0.1 loop: the human stays on a phone, Telegram sends the request to a Hermes gateway, Hermes loads `basd-coding-dispatch`, and worker backends do the coding only after the gates are satisfied.

No private chat identifiers, bot tokens, or project paths belong in the public workflow.

## Phone Request

```text
From Telegram:
Patch the install flow so Hermes is the default skill path and OpenClaw users get a workspace-skill install. Keep Codex and Claude as worker backends.
```

## Hermes Dispatcher Response

```text
Classification: install and public docs feature; public repo risk.
Worker routing: Codex implements CLI/docs changes; independent reviewer checks claims and tests.
Spec gate: native Hermes install must copy the full skill directory under the Hermes home. OpenClaw install may be documented only as workspace-skill compatible. Other harness adapters stay experimental/manual unless validated.
Implementation-plan gate: add failing smoke coverage, update CLI install target resolution, copy skill-local references, rewrite README/integration docs, then run package validation.
```

## Phone Approval

```text
Approved. Do not push, publish, or claim native marketplace support.
```

## Agent Work

Hermes routes the approved work to a coding backend. The worker edits inside the repository, avoids real `~/.hermes` mutation by using temp dirs in tests, and reports evidence back through Hermes:

```text
Changed:
- bin/basd-coding-dispatch.mjs
- skills/basd-coding-dispatch/**
- integrations/hermes/install.md
- integrations/openclaw/install.md
- README.md

Verification:
- npm run validate: passed
- npm run smoke-test: passed
- npm pack --dry-run: passed

Remaining risk:
- Cursor, OpenCode, and native Codex/Claude harness adapters remain experimental/manual until their install paths are validated.
```

## Superpowers Evidence Or Compensation

```text
Superpowers evidence:
- using-superpowers loaded before work.
- implementation-plan gate followed.
- independent review requested with a packet that included untracked files.
- verification-before-completion satisfied with fresh command output.

Compensation if a required skill/reference is missing:
- state the missing skill/reference.
- use the public quality profile and edge-case pack.
- use independent review and final verification before reporting completion.
```

## Final Verification Report

```text
Profile:
Provider/split:
Files changed:
Commands and exit statuses:
Independent review verdict:
Fixed findings:
Skipped checks:
Remaining risks:
No push/publish/PR/deploy status:
```

## Why This Works From A Phone

The phone is only the approval and control surface. Hermes keeps the durable skill, the coding backend keeps filesystem access, and the workflow requires concrete checkpoints before expensive or risky steps continue.
