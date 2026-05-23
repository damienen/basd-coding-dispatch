# Progressive Disclosure

Use this reference when adapting `basd-coding-dispatch` to a private operator setup, a larger skill library, or a public package.

## Goal

Keep `SKILL.md` as a router and gatekeeper, not a history log. The body should load fast, make the agent choose the right workflow, and point to detailed references only when needed.

## Layering model

1. **Skill description**
   - Trigger text only.
   - Include what the skill does, when to use it, and what it is not for.
   - Do not put procedure detail here.
2. **SKILL.md**
   - Core loop.
   - Hard gates.
   - Request classifier.
   - Reference routing.
   - Pitfalls that must be active every time.
3. **references/**
   - Provider commands.
   - Quality profiles.
   - Review packet shapes.
   - Edge-case checklists.
   - Private or project-specific lessons.
4. **Project-local docs**
   - One-project launch constraints, repo paths, credentials paths, and historical state.
   - Use project docs instead of bloating the global skill when the lesson is not reusable.

## What belongs in SKILL.md

Keep only instructions that must be present every time the skill fires:

- Basd is dispatcher/verifier, not the implementer.
- Approval gates: spec -> implementation plan -> code.
- No protected-branch push, merge, deploy, production mutation, credential/customer-data handling, or destructive cleanup without explicit approval.
- Provider/session classifier.
- Superpowers/normalpowers requirement for broad/risky work.
- Verification before closeout.
- Reference routing map.

## What belongs in references

Move detail into references when it is:

- provider-specific;
- project-specific;
- a historical failure mode;
- a long prompt template;
- a long checklist;
- a special-case PR/merge/deploy workflow;
- useful only for one domain such as mobile, Supabase, media apps, or commerce checkout.

## Private extension pattern

For private/internal installs, keep a public-safe base skill and add private references locally:

```text
skills/basd-coding-dispatch/
  SKILL.md                         # lean, reusable router
  references/
    README.md                      # loading order
    quality-gates.md               # reusable
    provider-command-recipes.md    # reusable
    private-project-context.md     # local-only, not public package
```

If a private install accumulates too much inline text, create a snapshot reference before slimming:

```text
references/dispatch-detailed-rules-YYYY-MM-DD.md
```

Then rewrite `SKILL.md` to point to that snapshot for archaeology only.

## Public package rule

The public repository must not include:

- private paths;
- credentials or credential file names;
- private chat identifiers;
- client/customer data;
- unvalidated provider marketplace/plugin claims;
- one-project internal history that does not generalize.

Public examples should describe portable process, not private operations.

## Verification

After slimming or adapting:

1. Count `SKILL.md` lines/chars before and after.
2. Confirm all referenced files exist in the installed skill directory.
3. Run package validation and smoke tests.
4. Pack dry-run to confirm the references are included.
5. Inspect changed files for private paths, token-like strings, and unsupported provider claims.
