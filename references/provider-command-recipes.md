# Provider Command Recipes

These recipes keep Hermes/OpenClaw dispatch portable while worker backends vary by project.

## Install Native Skill Targets

```bash
npx basd-coding-dispatch init
npx basd-coding-dispatch init --dir "$HERMES_HOME"
npx basd-coding-dispatch init --target openclaw --dir ~/openclaw-workspace
```

Use `--force` only when you have reviewed the installed skill files and intentionally want to replace them.

## Initialize Manual Workflow Files

```bash
npx basd-coding-dispatch init --target generic-agent --dir ./project
npx basd-coding-dispatch init --target codex --dir ./project
npx basd-coding-dispatch init --target claude-code --dir ./project
```

Codex and Claude are supported worker backends. Their native harness adapters remain manual or experimental unless the install path has been validated.

## Validate the Package

```bash
npm ci
npm run validate
npm run smoke-test
npm run workflow-evals
npm pack --dry-run
```

## Inspect Install Health

```bash
npx basd-coding-dispatch doctor
npx basd-coding-dispatch doctor --json
```

Use JSON output for automated checks that need source validation status, companion manifest status, native skill presence, companion skill drift details, and the top-level `installOk` aggregate.

## Dispatch Prompt Shape

```text
Classify this request.
Choose the worker-routing shape.
Produce the spec gate if needed.
Produce the implementation-plan gate before code.
Implement only after the gate is accepted.
Use independent review for meaningful code changes.
Verify before reporting completion.
```

## Split-Worker Shape

```text
Worker A: implement the approved plan.
Worker B: review the diff for correctness, tests, scope, docs, and leakage.
Dispatcher: reconcile findings, apply accepted fixes, run verification, and report.
```
