# TODO

Planned improvements for the Task Properties plugin. Decisions captured from the
maintainer; check items off as they land.

## Behavior

- [x] **Remove `progress` when a note loses all trigger tags.**
  Done — `syncFile` deletes the property when `noteHasAnyTag` is false and the
  property is present.

- [x] **Count indented / sub-tasks.** Confirmed desired behavior — already the
  case, since `computeProgress` counts every `listItem` with `i.task !== undefined`
  regardless of nesting depth. No change needed; documented here so it isn't
  "fixed" later by mistake.

- [x] **Debounce the recompute handler.** Done — changed paths accumulate in a
  Set and a single `debounce(…, 300)` flush processes them, re-reading the latest
  cache per file at flush time.

## Features

- [x] **Recompute-all.** Done — `recompute-all` command scans the vault via
  `getMarkdownFiles()` and runs `syncFile` on each; the same `recomputeAll()` runs
  once on load (in `onLayoutReady`) to backfill existing tagged notes. Covers the
  "manually sync active note" idea too.

- [x] **Configurable property name.** Done — `propertyName` setting (default
  `progress`); `syncFile` reads/writes/removes/dirty-checks via the configured key.
  Known limitation: renaming orphans the old property on existing notes — see below.

- [x] **Optional `percentage` field.** Done — `includePercentage` toggle;
  `computeProgress` adds `percentage` (0 when no tasks) inside the progress object.

## Project / release

- [x] **`release.yml` GitHub Action.** Already present
  (`.github/workflows/release.yml`) — the standard sample-plugin workflow. On
  pushing a tag it builds and attaches `main.js`, `manifest.json`, `styles.css` to
  a *draft* release (publish it to make BRAT pick it up). No changes needed.

- [x] **Unit tests for `src/progress.ts`.** Done — vitest added (`npm test`).
  `src/progress.test.ts` covers `computeProgress`, `noteHasAnyTag`, and
  `progressEquals` (17 tests). `obsidian` is types-only at runtime, so
  `vitest.config.ts` aliases it to `test/obsidian-stub.ts` (minimal `getAllTags`).

## Known limitations / follow-ups

- **Renaming the property orphans the old key.** When `propertyName` changes,
  notes keep the property under the old name (removal only targets the current
  key). Running "Recompute progress for all notes" writes the new key but does not
  delete the old one. Could track the previous property name and clean it up.
- **Settings changes don't auto-recompute.** Changing tags / property name /
  percentage only takes effect on the next edit or via the recompute command.
  Could call `recomputeAll()` after settings change (debounced).

## Explicitly out of scope

- Per-tag / per-folder scoping or mapping different tags to different properties.
