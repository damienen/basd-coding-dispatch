# Session Topology

Session topology maps the work shape to the smallest execution structure that preserves gates, ownership, review, and verification.

## Hermes/OpenClaw Dispatcher

Use Hermes or an OpenClaw workspace skill as the maintained dispatch layer:

- A mobile or Telegram request reaches the dispatcher.
- The dispatcher classifies the task and chooses the worker-routing shape.
- Codex, Claude, or another validated worker backend executes the approved work.
- Review and verification evidence returns to the human before completion is claimed.

The dispatcher keeps the same task-owner context across brainstorming -> implementation planning -> implementation -> fix loops so requirements and review dispositions do not drift.

## Single Worker

Use one worker for narrow tasks:

- Small bugfix.
- Documentation correction.
- Focused validation improvement.
- Single-file cleanup.

The worker still runs classification, planning, verification, and reporting. Tiny fixes still get lightweight independent review before completion is reported.

## Executing Plans

Use `executing-plans` for 1-2 tasks when the approved plan is mostly sequential and a single coordinator can execute it directly.

Good fits:

- One script plus one test file.
- One docs page plus one mirror copy.
- One package metadata change plus a focused smoke check.

## Subagent-Driven Development

Use `subagent-driven-development` for 3+ tasks when the approved plan has separable file ownership and benefits from implementer plus review checkpoints.

Good fits:

- Manifest/tests, docs/references, examples, and evals as separate task slices.
- Implementation with a spec compliance reviewer and quality reviewer.
- Work where the dispatcher must integrate final verification across multiple files.

## Dispatching Parallel Agents

Use `dispatching-parallel-agents` only for independent domains where agents can work without shared state or sequential dependencies.

Good fits:

- One agent verifies public docs claims while another updates isolated examples.
- One agent inspects provider docs while another edits generic package behavior.
- A read-only reviewer runs while implementation continues in disjoint files.

Do not parallelize edits to the same files or tightly coupled behavior.

## Implementer Plus Reviewer

Use one implementer and one independent reviewer when:

- The change affects user-facing behavior.
- The change touches release, install, or security paths.
- The code is easy to overfit to one provider.
- The plan has multiple files or unclear risk.

## Mobile Control

Mobile or chat-based control can work when the gates are preserved:

- Short command from the human.
- Dispatcher asks only the necessary clarifying questions.
- Brainstorming/spec and plan are posted back for approval when required.
- Implementation happens in the coding environment.
- Review intake and verification output are summarized back to the mobile channel.
