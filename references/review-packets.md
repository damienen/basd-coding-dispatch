# Review Packets

A review packet gives an independent reviewer enough context to find real issues without inheriting the implementer's assumptions.

## Required Inputs

- Request classification and selected quality profile.
- Approved spec decisions, including non-goals.
- Approved implementation plan and excluded work.
- Changed file list and full diff.
- Untracked files, new generated files, and deleted files.
- Verification commands already run, with exit statuses and important output.
- Skipped checks and the reason each was skipped.
- Known risks, rollback notes, and areas the reviewer should ignore as out of scope.

## Diff Evidence

Include both summary and detail:

```bash
git status --short --branch
git diff --stat
git diff
```

If new files are untracked, include their contents or add them before collecting the diff. Reviewers cannot assess files they cannot see.

## Verification Evidence

Use exact commands and status. Prefer concise transcript excerpts over vague summaries:

```text
npm run validate: exit 0
npm run smoke-test: exit 0
npm pack --dry-run: exit 0; inspected tarball contents
```

## Reviewer Instructions

Ask for findings first, ordered by severity. Require file and line references when possible. Bonus or out-of-scope findings should be marked as backlog/input rather than blocking in-scope completion.
