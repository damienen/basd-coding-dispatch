# Superpowers Integration

Superpowers is a phase-by-phase workflow layer for `basd-coding-dispatch`, not a vague companion install. When these skills are available, the dispatcher should load the relevant skill, follow its gate or checklist, and report concrete evidence before completion.

Upstream baseline: `obra/superpowers` commit `f2cbfbefebbfef77321e4c9abc9e949826bea9d7`.

Default companion coverage should include complete pinned upstream directories for all 14 Superpowers skills, including each directory's non-`SKILL.md` support files:

- `using-superpowers`
- `brainstorming`
- `using-git-worktrees`
- `writing-plans`
- `executing-plans`
- `subagent-driven-development`
- `dispatching-parallel-agents`
- `test-driven-development`
- `systematic-debugging`
- `requesting-code-review`
- `receiving-code-review`
- `verification-before-completion`
- `finishing-a-development-branch`
- `writing-skills`

## Phase Map

| Phase | Superpowers skill | Dispatch responsibility |
| --- | --- | --- |
| Session start | `using-superpowers` | Check which skills apply before answering or editing. |
| Discovery/spec | `brainstorming` | Run a Brainstorming Gate for broad, ambiguous, user-facing, UI/design, architecture, workflow, or public-doc work. |
| Isolation | `using-git-worktrees` | Use an isolated worktree after plan approval when feature work starts. |
| Plan writing | `writing-plans` | Produce implementation plans with exact files, tests, review, rollback, and approval boundaries. |
| Simple execution | `executing-plans` | Execute approved plans with 1-2 tightly scoped tasks. |
| Multi-task execution | `subagent-driven-development` | Coordinate 3+ implementation tasks with bounded ownership and review checkpoints. |
| Parallel side work | `dispatching-parallel-agents` | Split only independent domains that do not share writable files or sequential dependencies. |
| Feature/bug code | `test-driven-development` | Add or identify the failing check first when behavior changes. |
| Bug investigation | `systematic-debugging` | Capture symptoms, reproduce, find root cause, and avoid fix-by-guessing. |
| Review request | `requesting-code-review` | Send reviewers complete packets with diff, untracked files, constraints, and verification output. |
| Review intake | `receiving-code-review` | Read, restate, verify, evaluate, disposition, then fix only accepted in-scope findings. |
| Completion proof | `verification-before-completion` | Run fresh verification commands before making completion claims. |
| Branch finish | `finishing-a-development-branch` | Present closeout options after verification; do not push, PR, merge, or discard without approval. |
| Process updates | `writing-skills` | Use skill-writing discipline when changing reusable process docs or skill behavior. |

## Brainstorming Gate

Run the Brainstorming Gate before the Implementation-Plan Gate when the request is broad, ambiguous, user-facing, public, UI/design-heavy, architecture-affecting, workflow-changing, or likely to create public claims.

A useful Brainstorming Gate records:

- The user goal and non-goals.
- Candidate approaches and tradeoffs.
- Open questions or assumptions.
- Acceptance criteria that should not be invented later in the implementation plan.
- Whether visual, architecture, contract, or workflow evidence is needed.
- The decision or approved spec direction before planning implementation.

Exact low-risk tiny fixes do not need a full brainstorming ceremony. Use a micro-brainstorm only when ambiguity, user-visible tradeoffs, or scope uncertainty appears.

## Evidence Contract

Superpowers evidence should state:

- Skill names loaded for the task.
- Required checklist items or gates from those skills.
- How the implementation followed them.
- Review-intake dispositions when reviewer feedback exists.
- Verification commands that satisfy the completion rule.
- Any skill/reference that was missing or unavailable.

Bare prompt text or an unloaded skill name is insufficient. If a required Superpowers skill or reference is missing, blocked, or unavailable, state the gap and use compensation gates.

## Compensation

When a Superpowers skill cannot be loaded, compensate with Basd-controlled gates:

- Use the public quality profile and edge-case pack.
- Use the Brainstorming Gate or a clear reason it was not required.
- Use an implementation-plan gate before feature code.
- Use independent review with a complete review packet.
- Use review intake before fix loops.
- Run verification before completion.

Do not pretend a missing skill loaded. Report the compensation path explicitly.

## Pitfalls

- Do not let the implementation plan become the first place requirements are invented.
- Do not make full brainstorming mandatory for every tiny fix.
- Do not add generic public run-manifest or gate-ledger requirements.
- Do not change reviewer output into strict JSON only.
- Do not add provider marketplace or plugin claims without validation.

## Verification Checklist

- `integrations/companion-skills.json` installs complete pinned upstream directories for all 14 Superpowers skills by default for Hermes/OpenClaw companion installs.
- `scripts/validate.mjs`, `scripts/smoke-test.mjs`, and `scripts/workflow-evals.mjs` require the expected upstream support files.
- Workflow evals check Brainstorming Gate, debugging, review intake, closeout, and anti-overhead language.
- Root `references/*.md` and packaged mirror references stay byte-identical.
- Public docs remain free of private paths, credentials, private identifiers, and unvalidated provider metadata.

## Auto-Fix Policy

After an implementation plan is approved, the dispatcher may fix narrow in-scope findings from tests or review without a second approval. Ask the human before broad refactors, new features, new provider validations, snapshot commands, auto reviewer orchestration, or changes outside the approved plan.
