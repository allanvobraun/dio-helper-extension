import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

// See https://wxt.dev/guide/essentials/unit-testing.html
// `WxtVitest` swaps `browser` for an in-memory fake (@webext-core/fake-browser)
// and sets up WXT's auto-imports and aliases.
export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    // Unit tests live next to the code; `e2e/*.spec.ts` belongs to Playwright.
    include: ['src/**/*.test.ts'],
    mockReset: true,
    // DOM tests opt in with `// @vitest-environment happy-dom`. Never let
    // iframes (YouTube embeds in fixtures) navigate to the network.
    environmentOptions: {
      happyDOM: {
        settings: { navigation: { disableChildFrameNavigation: true } },
      },
    },
    restoreMocks: true,
  },
});
