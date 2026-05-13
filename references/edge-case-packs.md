# Edge-Case Packs

Edge-case packs are short recurring-miss checklists. They are deliberately non-exhaustive; use them to catch common gaps, then add project-specific cases from the approved plan.

## CLI, Tooling, And Package

- Unknown commands, `--help`, invalid options, and parse errors return the intended exit status.
- JSON and text outputs remain parseable and stable enough for callers.
- Init/install commands handle existing files, partial installs, `--force`, tilde paths, temp dirs, and offline/skip modes.
- Package files include needed references and exclude private or generated artifacts.
- Dry-run packaging confirms the public tarball shape.

## Frontend And UI

- Empty, loading, error, long text, narrow viewport, and keyboard/focus states are handled.
- Controls fit without overlap and have predictable disabled/active/hover states.
- Navigation preserves expected state and back/forward behavior.
- Visual claims are backed by screenshots or browser/device checks when changed.

## Backend And API

- Auth, authorization, validation, malformed input, and missing resource paths are covered.
- Idempotency, retries, concurrency, pagination, and timeout behavior are considered.
- Errors are structured and do not leak secrets.
- Data migrations, rollbacks, and backward compatibility are named when relevant.

## Mobile And Expo

- Cold start, offline/poor network, permissions, deep links, navigation state, and platform differences are considered.
- iOS and Android behavior is checked or the skipped platform is reported.
- Visual changes include device-sized evidence when practical.
- Native config, build profiles, and app store metadata are treated as release-risk changes.

## Public Docs And Repo

- Public docs do not include private paths, credentials, chat identifiers, or client/project data.
- Provider status labels match validated behavior.
- Links, examples, package contents, README, PR template, and skill references stay in sync.
- New process requirements do not contradict excluded scope.

## Dependency, Security, And Config

- New dependencies are justified and checked for license/security fit.
- Config changes avoid committing secrets and handle missing environment variables clearly.
- CI, release, deploy, and publish changes are reviewed as risky-release work.
- Security-sensitive changes get focused review even when the code diff is small.
