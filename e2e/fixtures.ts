import path from 'node:path';
import { type BrowserContext, test as base, chromium } from '@playwright/test';

const pathToExtension = path.resolve(
  import.meta.dirname,
  '../.output/chrome-mv3',
);

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright requires an object pattern as the first fixture argument.
  context: async ({}, use) => {
    // Extensions only load in a persistent context. The `chromium` channel
    // (Playwright's bundled Chromium) is needed for them to work headless.
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // MV3: the extension id is the host of the background service worker URL.
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    const extensionId = serviceWorker.url().split('/')[2];
    if (!extensionId) throw new Error('Could not resolve extension id');
    await use(extensionId);
  },
});

export const expect = test.expect;
