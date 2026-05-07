`basd-coding-dispatch` is a provider-neutral, subagent-driven coding workflow for plan-first AI coding agents.

[![CI](https://github.com/damienen/basd-coding-dispatch/actions/workflows/ci.yml/badge.svg)](https://github.com/damienen/basd-coding-dispatch/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/basd-coding-dispatch.svg)](https://www.npmjs.com/package/basd-coding-dispatch)
[![license](https://img.shields.io/npm/l/basd-coding-dispatch.svg)](LICENSE)
[![release](https://img.shields.io/github/v/release/damienen/basd-coding-dispatch?include_prereleases&label=release)](https://github.com/damienen/basd-coding-dispatch/releases)

Strong AI coding models still fail when they run without process. They skip the spec, start coding from a vague request, blur provider responsibilities, accept shallow review, and report completion before verification. This repo packages a repeatable dispatch workflow that keeps the model powerful but boxed into gates.

## Workflow

```text
request
  -> classify task
  -> choose provider: Codex / Claude / split
  -> spec gate
  -> implementation-plan gate
  -> implementation
  -> subagent review
  -> verification
  -> report
```

![basd-coding-dispatch workflow](assets/flow-diagram.svg)

## Quickstart

```bash
npx basd-coding-dispatch init
```

Target a specific harness:

```bash
npx basd-coding-dispatch init --target codex
npx basd-coding-dispatch init --target claude-code --dir ./project
npx basd-coding-dispatch init --target generic-agent --force
```

Run local checks:

```bash
npx basd-coding-dispatch doctor
npx basd-coding-dispatch validate
```

The installer refuses to overwrite files unless `--force` is provided. It writes process docs and skill/reference files only; it never writes credentials or native marketplace metadata.

## Adaptation Status

Native plugin and marketplace formats vary by provider and change over time. v0.1 is a file-based, provider-neutral scaffold. Hidden native metadata such as provider plugin manifests will be added only after each install path is validated.

| Target | Status | Install notes |
| --- | --- | --- |
| Hermes | experimental | See `integrations/hermes/install.md`. Manual scaffold only. |
| Codex CLI | experimental | See `integrations/codex/install.md`. Uses `AGENTS.md` plus the public skill files. |
| Claude Code | experimental | See `integrations/claude-code/install.md`. Uses `CLAUDE.md` plus the public skill files. |
| OpenCode | experimental | See `integrations/opencode/install.md`. Manual scaffold only. |
| Cursor | experimental | See `integrations/cursor/install.md`. Manual scaffold only. |
| Generic agents | tested | File scaffold behavior is covered by the smoke test. See `integrations/generic-agent/install.md`. |

## Quality Gates

- Classify the request before choosing a provider.
- Produce a spec gate for ambiguous work.
- Produce an implementation-plan gate before feature code.
- Keep provider mechanics in `references/` and `integrations/`, not in the portable skill body.
- Use independent review for meaningful implementation work.
- Verify with concrete commands, transcripts, examples, or screenshots before reporting done.
- Keep public repo files free of private paths, credentials, private client data, and unvalidated provider metadata.

See `references/quality-gates.md` for the full quality gates definitions.

## Examples

- `examples/small-fix.md`: small bugfix flow from classification through verification.
- `examples/feature-build.md`: feature work with separate spec and implementation-plan gates.
- `examples/dual-provider-review.md`: one provider implements, another reviews, and the dispatcher reconciles findings.
- `examples/telegram-agent-workflow.md`: mobile chat control while preserving the gates.

## Included Files

- `skills/basd-coding-dispatch/SKILL.md`: lean public skill for agents that support skill-style workflows.
- `references/`: provider-neutral process references.
- `integrations/`: install/adaptation notes for supported targets.
- `AGENTS.md` and `CLAUDE.md`: strict anti-slop governance files.
- `.github/`: issue templates, PR template, CI workflow, and safe release workflow skeleton.

## Inspiration

This project is inspired by the rigor of Superpowers-style agent workflows: explicit gates, review before trust, and verification before completion. It is not affiliated with Superpowers or any provider.

## Launch Writing

Launch writing happens after the repository is ready. This repo intentionally does not include launch article drafts in v0.1.
