# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Obsidian community plugin (`id: task-properties`) that syncs checkbox task statuses into a note's frontmatter `progress` property, so task completion can be surfaced in Obsidian Bases (requires app `1.9.0`+). Source lives under `src/` and is bundled to `main.js`.

## Commands

- `npm install` — install deps (Volta pins node 18 / pnpm 10; a `pnpm-lock.yaml` exists but `package.json` scripts and AGENTS.md target npm).
- `npm run dev` — esbuild watch build, emitting `main.js` with inline sourcemaps.
- `npm run build` — type-check (`tsc -noEmit -skipLibCheck`) then a minified production bundle. Run this to surface type errors.
- `npm test` — runs the vitest suite (`npm run test:watch` for watch mode). Tests cover the pure helpers in `src/progress.ts`. Because `obsidian` is types-only at runtime, `vitest.config.ts` aliases it to `test/obsidian-stub.ts`; keep that stub in sync if a test needs another `obsidian` export. Note the production `tsconfig` includes `**/*.ts`, so `*.test.ts` and `vitest.config.ts` are type-checked by `npm run build` too.
- `npm run version` — bumps `manifest.json` + `versions.json` via `version-bump.mjs` and stages them.
- Lint: `eslint src/` (config in `.eslintrc`; eslint is not a project dependency, install globally).

**Bumping the version**: the source of truth is `manifest.json`'s `version`. Whenever you change it you must also keep `versions.json` in sync (maps plugin version → `minAppVersion`). Use `npm run version` rather than editing by hand — it updates both files from `manifest.json` and stages them. Never bump `package.json` alone; Obsidian and BRAT read `manifest.json`.

`main.js` is a build artifact and is git-ignored — never edit or commit it. To test in a real vault, copy `main.js`, `manifest.json`, and `styles.css` into `<Vault>/.obsidian/plugins/task-properties/` and reload Obsidian. Note that BRAT only installs `main.js` from GitHub **releases** (not the repo tree, since it's git-ignored), so distributing a change requires cutting a release whose tag exactly matches `manifest.json`'s version.

## Architecture

Three modules under `src/`:

- `src/main.ts` — `TaskPropertiesPlugin` lifecycle: loads settings, registers the settings tab, and (inside `workspace.onLayoutReady`) registers a **single** `metadataCache.on('changed')` handler. That handler consumes the fresh `cache` arg the event provides, and recomputes `progress` via `app.fileManager.processFrontMatter`.
- `src/settings.ts` — `TaskPropertiesSettings` (`tags: string[]`, default `['goal']`), `DEFAULT_SETTINGS`, and `TaskPropertiesSettingTab`. The tab renders one editable row per trigger tag with a remove button, plus an "Add tag" button; `display()` is re-rendered on add/remove (not on keystroke, so text fields keep focus). Tags are normalized (lowercased, leading `#` stripped) on input.
- `src/progress.ts` — pure, testable helpers: `computeProgress(cache)`, `noteHasAnyTag(cache, tags)`, `progressEquals(a, b)`. No plugin state.

Key behaviors to preserve when editing:
- **Task counting**: from `cache.listItems`, a task is `i.task !== undefined`; completed is any non-space char (`i.task !== ' '`) — not just `'x'`. So `[x]`, `[/]`, `[-]` all count as done. `progress` shape is `{ completed, total, remaining }`.
- **Tag matching** uses `getAllTags(cache)` so it matches both inline `#tags` and frontmatter `tags` (string or array form), compared case-insensitively without the `#`.
- **Dirty-check**: the handler calls `progressEquals` and returns without writing when `progress` is unchanged. This is load-bearing — without it, our own frontmatter write re-triggers `'changed'` and loops forever. Keep any new write path guarded the same way.

## Conventions

`AGENTS.md` holds the upstream Obsidian sample-plugin guidance (manifest rules, release process, security/privacy policy, the recommendation to split code into `src/` modules once it grows, register-listener cleanup). Defer to it for plugin-release and Obsidian-API conventions; it is generic and not specific to this plugin's current single-file state.
