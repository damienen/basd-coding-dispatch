# Dual Provider Review Example

Reference files: `references/review-orchestration.md`, `references/session-topology.md`

## Request

Implement a release workflow skeleton and make sure it cannot publish unless the package token is configured.

## Classification

Release and packaging task. Higher risk because incorrect claims or unsafe publish behavior can affect public packages.

## Provider Selection

Provider A implements the workflow. Provider B reviews the diff and checks whether the workflow is safe, conventional, and honest.

## Implementer Brief

```text
Create a tag-based release workflow.
Run CI-like checks.
Publish only when the npm package token is configured.
Do not publish during implementation.
Do not create a release.
```

## Reviewer Brief

```text
Review the workflow for unsafe publish behavior, fake release claims, missing checks, and credential exposure.
Findings first. Include file and line references when possible.
```

## Dispatcher Reconciliation

The dispatcher accepts concrete findings, rejects out-of-scope suggestions, applies fixes, and reruns:

```bash
npm run validate
npm run smoke-test
npm pack --dry-run
```
