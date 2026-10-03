import { defineConfig } from '@playwright/test';

// See https://playwright.dev/docs/chrome-extensions
// Tests load the production build from `.output/chrome-mv3`, so run `pnpm test`
// (which builds first) rather than calling `playwright test` directly.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Each test launches its own browser with the extension; run them serially on CI.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
  },
});
