# Small Fix Example

Reference files: `references/quality-gates.md`, `references/quality-profiles.md`, `references/review-packets.md`, `references/provider-command-recipes.md`

## Request

The CLI exits zero for an unknown command. Make unknown commands print help and exit nonzero.

## Classification

Small fix using the `tiny-fix` quality profile. User-visible CLI behavior. No spec gate needed beyond the stated behavior.

## Worker Routing

Codex implements. Independent review is lightweight because tiny fixes still get a separate reviewer check.

## Implementation Plan

1. Add a smoke-test assertion for unknown commands.
2. Confirm the assertion fails.
3. Update the command dispatcher to print help and return a nonzero status.
4. Run the smoke test and validation.

## Review

Reviewer checks that known commands still work, unknown commands fail, and help text remains accurate.

Review packet includes `git status --short --branch`, the focused diff, untracked files if any, and the smoke-test output.

## Verification

```bash
npm run smoke-test
npm run validate
```

Report both exit statuses before marking the fix complete.
