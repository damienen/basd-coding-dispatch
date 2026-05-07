# Provider Command Recipes

These recipes describe command shapes without depending on a specific proprietary harness.

## Initialize Workflow Files

```bash
npx basd-coding-dispatch init --target generic-agent
npx basd-coding-dispatch init --target codex --dir ./project
npx basd-coding-dispatch init --target claude-code --dir ./project
```

Use `--force` only when you have reviewed the destination files and intentionally want to replace them.

## Validate the Package

```bash
npm ci
npm run validate
npm run smoke-test
npm pack --dry-run
```

## Dispatch Prompt Shape

```text
Classify this request.
Choose the provider shape.
Produce the spec gate if needed.
Produce the implementation-plan gate before code.
Implement only after the gate is accepted.
Use independent review for meaningful code changes.
Verify before reporting completion.
```

## Split-Provider Shape

```text
Provider A: implement the approved plan.
Provider B: review the diff for correctness, tests, scope, docs, and leakage.
Dispatcher: reconcile findings, apply accepted fixes, run verification, and report.
```
