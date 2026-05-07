# AGENTS.md

## Anti-Slop Governance

This repository is for plan-first AI coding. Do not treat a strong model as a substitute for process.

## Required Conduct

1. Classify the request before implementation.
2. Choose the provider or provider split explicitly.
3. Use a spec gate when the request is ambiguous, user-facing, broad, risky, or cross-module.
4. Use an implementation-plan gate before feature work.
5. Keep code changes scoped to the approved plan.
6. Use independent review for meaningful implementation work.
7. Verify before reporting completion.
8. Report exact commands, evidence, skipped checks, and remaining risk.

## Hard Stops

- Do not invent marketplace/plugin support that has not been validated.
- Do not add hidden provider metadata unless the install path is tested.
- Do not commit private paths, credentials, private chat identifiers, or private client/project data.
- Do not push, publish, release, or open a PR unless the maintainer explicitly asks.
- Do not mark work complete without verification evidence.

## Repo Checks

Run these before completion:

```bash
npm run validate
npm run smoke-test
npm pack --dry-run
```

Use `npm ci` when a lockfile is present and dependency installation is part of the task.
