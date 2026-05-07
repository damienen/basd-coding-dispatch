# Mobile Chat Agent Workflow Example

Reference files: `references/quality-gates.md`, `integrations/generic-agent/install.md`

This example shows a mobile chat control loop while preserving dispatch gates. It uses generic chat references only and does not include private chat identifiers.

## Mobile Request

```text
Fix the install docs so they are clear about tested versus experimental provider support.
```

## Dispatcher Response

```text
Classification: documentation fix with public repo risk.
Provider: generic agent implements, dispatcher reviews.
Spec gate: clarify status labels without claiming native plugin support.
Implementation-plan gate: update README adaptation table and integration docs, then run validation.
```

## Human Approval

```text
Approved. Keep it concise and do not add marketplace claims.
```

## Agent Work

The coding environment performs the edits, runs checks, and reports back to the mobile channel:

```text
Changed README.md and integrations/*/install.md.
Verification:
- npm run validate: passed
- npm run smoke-test: passed
Remaining risk: native harness install paths still need provider-specific validation.
```
