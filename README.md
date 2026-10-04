# DIO Helper

A browser extension for watching lessons on [DIO](https://web.dio.me). It hides the auto-generated subtitles, adds a theater mode to the lesson page, and opens the current lesson on YouTube at the point where you stopped.

It runs only on `web.dio.me` and needs one permission, `storage`, to save your settings. It works in Chrome and Firefox.

## Features

### Subtitles off by default

DIO turns on YouTube's Portuguese auto-captions for every lesson. DIO Helper turns them off on every lesson player, including the next player after the intro clip and each new lesson you open.

Turn **Legendas** on in the popup to bring the captions back. While captions are on, the toolbar icon shows a pink **CC** badge.

### Theater mode

**Modo teatro** widens the lesson video to the full page width and collapses DIO's right column, like theater mode on YouTube.

- Turn it on or off in the popup, or press **T** on a lesson page.
- The **T** key doesn't fire while you're typing in a field, or while the video has focus (keys pressed then go to the YouTube player). Click outside the video first.
- The layout is applied with CSS, so it stays in place when DIO re-renders the page.

### Open the lesson on YouTube

Many DIO lessons are YouTube videos. On a lesson page, **Abrir no YouTube** opens that video on YouTube in a new tab, starting from where you stopped. The button shows that point (for example `· 12:34`).

- DIO plays a short promo before some lessons. DIO Helper skips it and opens the real lesson video. It recognizes the promo by comparing the video's length with the length DIO lists for the lesson.
- If a lesson has no YouTube video, the popup says so and disables the button.

### Popup

Opened on a lesson, the popup shows the lesson title, the course name, and how much of the video you've watched. Anywhere else, it shows a shortcut to dio.me.

Settings are saved with `storage.sync`, so they follow your browser profile across devices.

## Install from source

You need [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm build            # Chrome, output in .output/chrome-mv3
pnpm build:firefox    # Firefox, output in .output/firefox-mv2
```

- **Chrome:** open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select `.output/chrome-mv3`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on** and select any file inside `.output/firefox-mv2`.

## Development

Built with [WXT](https://wxt.dev), [Svelte 5](https://svelte.dev), TypeScript and [Tailwind CSS v4](https://tailwindcss.com).

| Command | Purpose |
|---|---|
| `pnpm dev` / `pnpm dev:firefox` | Dev mode with HMR (opens a browser with the extension loaded) |
| `pnpm build` / `pnpm build:firefox` | Production build into `.output/` |
| `pnpm zip` / `pnpm zip:firefox` | Package for store upload |
| `pnpm check` | Type and Svelte checks (`svelte-check`) |
| `pnpm biome` / `pnpm biome:fix` | Lint and format check / apply fixes |
| `pnpm test:unit` | Vitest unit tests |
| `pnpm test` | Build, then run the Playwright e2e tests against the built extension |

Run `pnpm exec playwright install chromium` once before the first e2e run.

### Project layout

```
src/
  entrypoints/
    background.ts        # keeps the toolbar CC badge in sync with the subtitles setting
    content.ts           # runs on web.dio.me, wires the controllers below
    popup/               # popup UI
  lib/
    settings.ts          # showSubtitles and theaterMode (storage.sync)
    content/
      subtitles/         # turns captions on/off on DIO's YouTube players
      theater/           # theater layout and the T shortcut
      lesson/            # reads the current lesson and finds its YouTube video
      dio/               # DIO page and YouTube player helpers
    messaging/           # typed popup ↔ content script messaging
    popup/               # popup components and state
e2e/                     # Playwright specs
```
