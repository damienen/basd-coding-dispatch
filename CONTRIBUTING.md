# Contributing

Contributions should improve the workflow, docs, examples, validation, or installer without turning v0.1 into a marketplace implementation.

## Before Opening a PR

1. Confirm the change belongs in core, references, integrations, examples, or tooling.
2. Keep provider-specific mechanics out of `skills/basd-coding-dispatch/SKILL.md`.
3. Do not add private paths, credentials, chat identifiers, private client data, or unvalidated native plugin metadata.
4. Run:

```bash
npm ci
npm run validate
npm run smoke-test
npm pack --dry-run
```

## Provider Adapters

Provider adapters should start as documented manual install steps unless the native plugin or extension path has been validated. Include evidence in the PR: commands, transcript, screenshots, or a minimal reproducible fixture.

## Documentation Style

- Be precise about tested versus experimental behavior.
- Prefer neutral examples.
- Explain operational gates in references and examples instead of expanding the portable skill into a large manual.
