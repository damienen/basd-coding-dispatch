# Session Topology

## Single Provider

Use one provider for narrow tasks:

- Small bugfix.
- Documentation correction.
- Focused validation improvement.
- Single-file cleanup.

The provider still runs classification, planning, verification, and reporting.

## Implementer Plus Reviewer

Use one implementer and one independent reviewer when:

- The change affects user-facing behavior.
- The change touches release, install, or security paths.
- The code is easy to overfit to one provider.
- The plan has multiple files or unclear risk.

## Dispatcher With Subagents

Use a dispatcher when the work has parallel tracks:

- Documentation and CLI can be implemented independently.
- One agent can inspect provider docs while another implements generic logic.
- A reviewer can run while implementation continues on a disjoint area.

The dispatcher owns final integration and verification.

## Mobile Control

Mobile or chat-based control can work when the gates are preserved:

- Short command from the human.
- Dispatcher asks only the necessary clarifying questions.
- Spec and plan are posted back for approval.
- Implementation happens in the coding environment.
- Verification output is summarized back to the mobile channel.
