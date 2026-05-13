# Quality Profiles

Quality profiles choose default gates for common work shapes. They are starting points, not ceilings: if the dispatcher detects risk, it auto-escalates gates, tests, review depth, or the edge-case pack.

## Profile Matrix

| Profile | Default gates | Default review level | Default tests | Auto-escalate when |
| --- | --- | --- | --- | --- |
| `tiny-fix` | Classification, worker-routing, compact implementation plan, micro-brainstorm only if ambiguity exists, diff hygiene, verification | Lightweight independent review | Focused regression or smoke command plus affected validation | User-facing behavior, install paths, release logic, public docs, security, data loss, or unclear scope appears |
| `standard-feature` | Classification, spec when needed, Brainstorming Gate when requirements are broad/ambiguous/user-facing, implementation plan, plan-lint checklist, review packet, verification | Independent review of the full diff | Focused tests, smoke path, and package/repo validation | Multiple modules, persistence, concurrency, auth, payments, dependencies, or ambiguous acceptance criteria appear |
| `risky-release` | Full spec, Brainstorming Gate, implementation plan, rollback, review packet, release/diff hygiene, verification, explicit branch closeout | Independent review before any release action | CI-like validation, smoke, dry run, and release-specific checks | Publish, deploy, token, provenance, workflow, or rollback behavior changes |
| `mobile-ui` | Brainstorming Gate with visual companion default when useful, spec with screen/user flow, implementation plan, design review, accessibility/diff hygiene, verification | Independent review with visual or interaction evidence | Component tests where useful, device/browser smoke, screenshots for changed flows | Navigation, gestures, responsive layout, accessibility, or state persistence changes |
| `backend-api` | Spec with contract/non-goals, brainstorming for contract tradeoffs, systematic-debugging for bugs, implementation plan, edge-case pack, review packet, verification | Independent review focused on contract, security, and data safety | Unit/integration tests for success, failure, auth, validation, and migration paths | Auth, rate limits, idempotency, migrations, queues, webhooks, or external APIs appear |
| `cli-package` | CLI contract spec when behavior changes, Brainstorming Gate for workflow/public-claim changes, implementation plan, package edge-case pack, smoke, pack dry run | Independent review focused on install/package behavior | CLI smoke tests, validation, `npm pack --dry-run`, JSON/text output parsing when applicable | Init/install behavior, package files, path handling, force/overwrite, or public claims change |
| `public-docs` | Classification, docs scope, Brainstorming Gate for workflow/public-claim changes, fact/claim check, diff hygiene, verification | Lightweight independent review for claim accuracy and leakage | Link/reference validation, leakage scan, package dry run when packaged docs change | Docs mention provider status, install support, security, release, private workflow, or unverified marketplace support |

## Brainstorming Scale

Use full brainstorming for broad, ambiguous, user-facing, public-doc, workflow, architecture, or design work. Use a micro-brainstorm for `tiny-fix` only when ambiguity, unclear scope, or tradeoffs appear. Exact low-risk tiny fixes should stay compact.

## Test Escalation Policy

Start with the profile's default tests. Add broader checks when a change crosses module boundaries, touches install/release/security behavior, or changes public claims. If a focused test cannot directly prove the behavior, record the gap and compensate with a broader smoke, manual transcript, or independent review note.

## Review Escalation Policy

All implementation profiles require independent review. Tiny fixes may use a short reviewer packet and compact findings. Risky-release, backend-api, CLI/package, public-docs, and mobile UI work need the full packet from `references/review-packets.md`.

## Closeout Policy

Branch closeout is a decision gate after verification, not an automatic side effect. Preserve local-only work unless the human explicitly approves push, PR, merge, publish, release, deploy, or discard actions.

## Diff Hygiene

Keep the diff aligned with the selected profile. Remove unrelated edits, generated churn, debug output, private paths, hidden provider metadata, and claims that exceed tested evidence.
