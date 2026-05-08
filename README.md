`basd-coding-dispatch` is a native Hermes/OpenClaw coding-dispatch skill for approval-gated coding from Telegram and mobile chat.

[![CI](https://github.com/damienen/basd-coding-dispatch/actions/workflows/ci.yml/badge.svg)](https://github.com/damienen/basd-coding-dispatch/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/basd-coding-dispatch.svg)](https://www.npmjs.com/package/basd-coding-dispatch)
[![license](https://img.shields.io/npm/l/basd-coding-dispatch.svg)](LICENSE)
[![release](https://img.shields.io/github/v/release/damienen/basd-coding-dispatch?include_prereleases&label=release)](https://github.com/damienen/basd-coding-dispatch/releases)

Run serious coding work from your phone without letting the agent skip process. A Telegram message can enter your Hermes gateway, load this skill, classify the task, ask for the right approvals, route implementation to Codex or Claude worker backends, enforce quality gates, force independent review when it matters, and report only after verification evidence exists.

Hermes is the maintained home for v0.1. OpenClaw users can use the same workflow as a workspace skill. Provider neutrality remains real, but it is a backend worker-routing mechanism rather than the headline: the dispatcher owns the gates, and Codex, Claude, or another validated backend does the work.

## Workflow

```text
Telegram / mobile request
  -> Hermes gateway or OpenClaw workspace skill
  -> classify task
  -> choose worker-routing: Codex / Claude / split
  -> spec gate
  -> implementation-plan gate
  -> implementation
  -> subagent review
  -> verification
  -> report
```

![basd-coding-dispatch workflow](assets/flow-diagram.svg)

## Quickstart

Install the full Hermes skill directory (default target):

```bash
npx basd-coding-dispatch init
```

Install into a specific Hermes home:

```bash
npx basd-coding-dispatch init --dir ~/.hermes
```

Install for OpenClaw workspace skills:

```bash
npx basd-coding-dispatch init --target openclaw --dir ~/openclaw-workspace
```

Create the manual project scaffold for a generic agent:

```bash
npx basd-coding-dispatch init --target generic-agent --dir ./project
```

Inspect local install status:

```bash
npx basd-coding-dispatch doctor
npx basd-coding-dispatch validate
```

Hermes and OpenClaw targets install `skills/basd-coding-dispatch/` as a self-contained skill, including `SKILL.md` and skill-local `references/`. They refuse to overwrite existing skill files unless `--force` is provided. Manual adapter targets write process docs and skill/reference files into a project; they never write credentials or unvalidated native marketplace metadata.

## Adaptation Status

Hermes is the flagship install path for v0.1. OpenClaw support is based on the verified local workspace-skill layout: `openclaw skills info aeo-geo` reports source `openclaw-workspace` and a path under `~/openclaw-workspace/skills/...`. Other harnesses remain manual or experimental adapters until their native install paths are validated.

| Target | Status | Install notes |
| --- | --- | --- |
| Hermes | tested | Flagship full-skill install under `$HERMES_HOME/skills/` or `~/.hermes/skills/`. See `integrations/hermes/install.md`. |
| OpenClaw | tested | Workspace-skill install under `$OPENCLAW_WORKSPACE/skills/` or `~/openclaw-workspace/skills/`. See `integrations/openclaw/install.md`. |
| Generic agents | tested | Manual file scaffold behavior is covered by the smoke test. See `integrations/generic-agent/install.md`. |
| Codex CLI | experimental | Supported worker backend; native harness adapter is manual. See `integrations/codex/install.md`. |
| Claude Code | experimental | Supported worker backend; native harness adapter is manual. See `integrations/claude-code/install.md`. |
| OpenCode | experimental | Future/manual adapter only. See `integrations/opencode/install.md`. |
| Cursor | experimental | Future/manual adapter only. See `integrations/cursor/install.md`. |

## Quality Gates

- Classify the request before choosing a worker-routing shape.
- Produce a spec gate for ambiguous work.
- Produce an implementation-plan gate before feature code.
- Keep worker-routing mechanics in `references/` and `integrations/`, not in the portable skill body.
- Use independent review for meaningful implementation work.
- Verify with concrete commands, transcripts, examples, or screenshots before reporting done.
- Keep public repo files free of private paths, credentials, private client data, and unvalidated provider metadata.

See `skills/basd-coding-dispatch/references/quality-gates.md` for the installed skill reference and `references/quality-gates.md` for repo browsing.

## Examples

- `examples/small-fix.md`: small bugfix flow from classification through verification.
- `examples/feature-build.md`: feature work with separate spec and implementation-plan gates.
- `examples/dual-provider-review.md`: one worker implements, another reviews, and the dispatcher reconciles findings.
- `examples/telegram-agent-workflow.md`: flagship phone-to-Hermes flow from Telegram through approval, worker routing, review, and verification.

## Included Files

- `skills/basd-coding-dispatch/SKILL.md`: lean public skill for Hermes, OpenClaw, and agents that support skill-style workflows.
- `skills/basd-coding-dispatch/references/`: reference files included with native skill installs.
- `references/`: repo-level copies of the process references for browsing.
- `integrations/`: install/adaptation notes for supported targets.
- `AGENTS.md` and `CLAUDE.md`: strict anti-slop governance files.
- `.github/`: issue templates, PR template, CI workflow, and safe release workflow skeleton.

## Inspiration

This project is inspired by the rigor of Superpowers-style agent workflows: explicit gates, review before trust, and verification before completion. It is not affiliated with Superpowers or any provider.

## Launch Writing

Launch writing happens after the repository is ready. This repo intentionally does not include launch article drafts in v0.1.
