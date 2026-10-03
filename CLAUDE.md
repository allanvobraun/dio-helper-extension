# CLAUDE.md

## Project context

`dio-helper-extension` is a browser extension (Chrome first, Firefox supported) built with **[WXT](https://wxt.dev)** + **Svelte 5** + **TypeScript**, managed with **pnpm**.

### Stack
- **WXT** (`wxt` ^0.21): extension framework on top of Vite. It generates `manifest.json` from the entrypoints and `wxt.config.ts`, so never write a manifest by hand.
- **Svelte 5** through `@wxt-dev/module-svelte` (registered in `wxt.config.ts` → `modules`).
- **TypeScript**: `tsconfig.json` extends the generated `.wxt/tsconfig.json`.

### Layout (`srcDir: 'src'`)
- `src/entrypoints/`: each file or folder here is an extension entrypoint, and WXT discovers them by name:
  - `background.ts`: service worker, `export default defineBackground(() => { ... })`.
  - `content.ts` (or `*.content.ts` / `content/index.ts`): content scripts, `export default defineContentScript({ matches, main })`.
  - `popup/`: popup UI (`index.html` → `main.ts` mounts `App.svelte` with Svelte's `mount`).
  - Other UI entrypoints (options, sidepanel, etc.) follow the same `name/index.html` pattern.
- `src/lib/`: shared Svelte components and modules.
- `src/assets/`: assets that go through the bundler. `public/`: static files copied as-is (icons in `public/icon/`).
- Generated folders, never edit: `.wxt/`, `.output/` (build output), `.svelte-kit/`.

### WXT conventions
- `defineBackground`, `defineContentScript`, `browser`, `storage`, etc. are **auto-imported** by WXT. Don't add manual imports for them unless a file needs them explicitly.
- Use the `browser` global (from `wxt/browser`) instead of `chrome.*` so the code works in both Chrome and Firefox.
- Manifest options (permissions, host_permissions, name, etc.) go in `wxt.config.ts` under `manifest`. Entrypoint options (matches, run_at, etc.) go in the entrypoint's `define*` call.
- If types or auto-imports look wrong after adding or renaming entrypoints, run `pnpm wxt prepare` (this also runs on `postinstall`).
- When you're unsure about a WXT API, check https://wxt.dev rather than relying on memory.

### Commands
| Command | Purpose |
|---|---|
| `pnpm dev` / `pnpm dev:firefox` | Dev mode with HMR (opens a browser with the extension loaded) |
| `pnpm build` / `pnpm build:firefox` | Production build into `.output/` |
| `pnpm zip` / `pnpm zip:firefox` | Package for store upload |
| `pnpm check` | `svelte-check` type and Svelte diagnostics |
| `pnpm test` | Production build, then Playwright e2e tests against the built extension |
| `pnpm test:ui` | Same, in Playwright's UI mode |
| `pnpm biome` | Biome lint + format + import sorting check (`biome check .`), read-only |
| `pnpm biome:fix` | Apply safe Biome fixes and formatting (`biome check --write .`) |
| `pnpm lint` / `pnpm format` | Lint only / format only (writes) |

### Styling: Tailwind CSS v4
- **[Tailwind CSS v4](https://tailwindcss.com)** is installed through the Vite plugin (`tailwindcss` + `@tailwindcss/vite`), registered in `wxt.config.ts` under `vite: () => ({ plugins: [tailwindcss()] })`. There's no `tailwind.config.js` and no PostCSS config. v4 is CSS-first, so don't add them.
- The stylesheet entry for each UI entrypoint does `@import 'tailwindcss';` (popup: `src/entrypoints/popup/app.css`, imported in `main.ts`). A new UI entrypoint (options, sidepanel, …) needs its own CSS file with that import, imported from its `main.ts`.
- Theme customization (colors, fonts, breakpoints) goes in an `@theme { ... }` block in CSS, not in JS config.
- Prefer utility classes in Svelte markup. Custom global CSS goes inside `@layer base` / `@layer components`. Unlayered CSS beats every Tailwind utility regardless of specificity, so the popup starter styles are wrapped in `@layer base`.
- **No arbitrary sizes.** Use Tailwind's standard scale modifiers (`p-2`, `size-5.5`, `w-80`, `text-sm`, `leading-tight`, `tracking-widest`, `rounded-md`, `border-2`, …), never bracketed values like `py-[9px]`, `text-[13px]`, `w-[320px]` or `leading-[1.45]`. Round to the nearest standard step; v4 spacing utilities accept any multiple of 0.25 (`h-5.5` = 22px), so spacing rarely needs brackets. If a size is used repeatedly and no standard step fits, add a named token to `@theme` (e.g. `--text-2xs`) instead of a bracket. In custom CSS, use `--spacing(n)` and `var(--text-*)` / `var(--radius-*)` rather than raw px.
- A Svelte `<style>` block that uses `@apply` or `theme()` must start with `@reference '../path/to/app.css';` (Tailwind v4 processes each `<style>` block on its own).
- **Content scripts**: don't import the Tailwind stylesheet directly into a page. Preflight would reset the host site's styles. Use WXT's `createShadowRootUi` with `cssInjectionMode: 'ui'` so the styles stay inside a shadow root.
- Biome parses Tailwind directives (`@theme`, `@apply`, `@reference`, …) through `css.parser.tailwindDirectives: true` in `biome.json`.

### Testing: Playwright (e2e)
- **[Playwright](https://playwright.dev/docs/chrome-extensions)** (`@playwright/test`) loads the real built extension into Chromium. Config is in `playwright.config.ts`, tests are in `e2e/*.spec.ts`.
- Tests run against `.output/chrome-mv3`, so `pnpm test` runs `wxt build` first. Calling `playwright test` alone uses whatever build is already there, which may be stale.
- Always import `test` / `expect` from `e2e/fixtures.ts`, not from `@playwright/test`. The fixtures launch a persistent context with the extension loaded (extensions only work in persistent contexts) and provide an `extensionId` fixture taken from the MV3 service worker URL.
- Keep `channel: 'chromium'` in the fixture. Headless extension loading only works with Playwright's bundled Chromium; branded Chrome/Edge removed the side-loading flags.
- Put selectors for each extension page in a page object under `e2e/pages/` (see `e2e/pages/popup.ts`, which returns Playwright locators) and keep the specs to actions and assertions. Use locators and web-first assertions (`await expect(locator).toHaveText(...)`), not `waitForSelector` or element handles.
- Extension pages: ``page.goto(`chrome-extension://${extensionId}/popup.html`)`` (same for `options.html`, `sidepanel.html`, …).
- Content scripts: stub the target site with `page.route(...)` + `route.fulfill(...)` so tests don't hit the network. Content scripts still inject on fulfilled responses (see `e2e/content.spec.ts`).
- Background: reach the service worker through `context.serviceWorkers()` / `context.waitForEvent('serviceworker')` and use `serviceWorker.evaluate(...)`. MV3 workers suspend after ~30s idle, and an `evaluate` in flight then throws "Service worker restarted".
- First-time setup on a machine: `pnpm exec playwright install chromium`.
- Output folders (`test-results/`, `playwright-report/`, `blob-report/`) are gitignored and ignored by Biome.

### Linting & formatting: Biome
- **[Biome](https://biomejs.dev)** (`@biomejs/biome`, pinned exact) is the only linter and formatter, so don't add ESLint or Prettier. Config is in `biome.json`.
- Svelte, HTML and CSS are covered by `html.experimentalFullSupportEnabled` ([HTML super-language support](https://biomejs.dev/internals/language-support/#html-super-languages-support), still experimental). If a Biome rule clearly misfires on Svelte syntax, turn it off for `**/*.svelte` in an `overrides` entry. Don't rewrite correct Svelte code to work around it.
- Style: 2-space indent, single quotes, semicolons, `<script>`/`<style>` content indented, and void elements self-closed (`<meta />`).
- Ignored: `node_modules`, `.output`, `.wxt`, `.svelte-kit`, `pnpm-lock.yaml`, `*.svg`.
- Recommended preset rules are on. Fix the underlying problem instead of adding `biome-ignore` comments. If an ignore really is needed, include a reason (`// biome-ignore lint/<group>/<rule>: <reason>`).

## Validating changes (run after every feature or fix)

Before you call a task done, run these from the project root and fix everything they report:

1. **Lint and format**: run `pnpm biome:fix` to apply formatting and safe fixes, then `pnpm biome`. It must finish with **no errors or warnings**. Fix any remaining lint diagnostics by hand.
2. **Type and Svelte check**: `pnpm check` (runs `svelte-check --tsconfig ./tsconfig.json`). It must finish with **0 errors and 0 warnings**.
3. **Tests**: `pnpm test` (builds, then runs the Playwright e2e suite). All tests must pass. When you add or change user-visible behavior (popup/options UI, content script effects, background messaging), add or update a spec in `e2e/`.
4. **Build**: `pnpm build`. It must succeed, which confirms WXT can generate the manifest and bundle every entrypoint.

Report the results of these commands to the user. If a step fails and you can't fix it, say so and include the output.

---

This project uses **Svelte 5** (runes mode). The official Svelte Claude Code plugin is installed and MUST be used for all Svelte work.

> Setup (once per machine):
> ```
> /plugin marketplace add sveltejs/ai-tools
> /plugin install svelte
> ```
> The plugin provides: the Svelte MCP server (stdio), the `svelte-file-editor` subagent, and the `svelte-code-writer` and `svelte-core-bestpractices` skills.

## Rule #1 — Delegate Svelte files to the `svelte-file-editor` agent

Whenever a task involves **creating, editing, reviewing, or analyzing** any of these files:

- `*.svelte` components
- `*.svelte.ts` / `*.svelte.js` modules

…delegate that work to the **`svelte-file-editor`** subagent instead of editing the file directly in the main session. The subagent runs in its own context window, so it can fetch docs and iterate with the autofixer without filling up the main conversation.

- Give the agent a self-contained brief: the file path(s), the goal, relevant constraints, and any related non-Svelte files it should know about.
- If several Svelte files need changes, invoke the agent per file (or per tightly related group of files).
- After the agent returns, review its summary (changes made, issues fixed by the autofixer) before continuing.
- Plain `.ts` / `.js` files (e.g. `+page.ts`, `+server.ts`, `hooks.server.ts`) can be handled in the main session, but still use the Svelte MCP docs tools when SvelteKit APIs are involved.

## Rule #2 — Use the Svelte MCP tools

If for any reason you work on Svelte code outside the subagent, follow this workflow with the Svelte MCP server tools:

1. **`list-sections`** — Call FIRST for any Svelte/SvelteKit question or task to discover available documentation sections (titles, `use_cases`, paths).
2. **`get-documentation`** — Analyze the `use_cases` from `list-sections` and fetch ALL sections relevant to the task. Do not rely on memory for Svelte 5 / SvelteKit APIs.
3. **`svelte-autofixer`** — MUST be run on every piece of Svelte code before it is written or shown to the user. Fix every reported issue/suggestion and re-run until it returns none.
4. **`playground-link`** — Only offer this when code was NOT written to project files, and only call it after the user confirms they want a link.


## Rule #4 — Follow Svelte 5 best practices

Load the **`svelte-core-bestpractices`** skill whenever writing or analyzing Svelte code. Key points:

- Use runes: `$state`, `$derived` (not `$effect`) for computed values, `$props` instead of `export let`.
- Treat `$effect` as an escape hatch; never update state inside effects when a `$derived`, event handler, or `{@attach}` would work.
- Use `onclick={...}` instead of `on:click`, `{#snippet}` / `{@render}` instead of `<slot>`, `{@attach}` instead of `use:action`.
- Always key `{#each}` blocks with a unique id (never the index).
- Prefer `createContext` over shared module state; prefer classes with `$state` fields over stores.
- No legacy syntax (`$:`, `$$props`, `<svelte:component>`, `<svelte:self>`, `class:` directive) in new code.

## Definition of done for Svelte changes

- [ ] Work was done via `svelte-file-editor` (or the MCP workflow above).
- [ ] Relevant docs were fetched with `get-documentation`.
- [ ] `svelte-autofixer` reports no issues or suggestions.
- [ ] No Svelte 4 / legacy syntax introduced.
- [ ] `pnpm biome` is clean, `pnpm check` passes, `pnpm test` passes, and `pnpm build` succeeds (see "Validating changes").