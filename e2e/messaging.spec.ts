import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { openPopup } from './pages/popup';

// The service worker's `chrome` global, as far as these tests use it.
declare const chrome: {
  tabs: { query(query: { active: true }): Promise<{ id?: number }[]> };
};

/**
 * Browser tab id of `page`. The extension has no `tabs` permission, so tabs
 * can't be queried by URL: bring the page to the front and read the active tab.
 */
async function tabIdOf(context: BrowserContext, page: Page) {
  await page.bringToFront();
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker');
  }
  const tabId = await serviceWorker.evaluate(
    async () => (await chrome.tabs.query({ active: true }))[0]?.id,
  );
  if (tabId === undefined) throw new Error(`No tab found for ${page.url()}`);
  return tabId;
}

test('popup reaches the content script on a DIO tab', async ({
  context,
  extensionId,
}) => {
  const dio = await context.newPage();
  await dio.route('https://web.dio.me/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><head><title>Aula stub</title></head><body>stub</body></html>',
    }),
  );
  const contentReady = dio.waitForEvent('console', {
    predicate: (msg) => msg.text() === 'Hello content.',
  });
  await dio.goto('https://web.dio.me/lesson');
  await contentReady;

  const tabId = await tabIdOf(context, dio);
  const popup = await openPopup(await context.newPage(), extensionId, {
    tabId,
  });

  // The popup falls back to offsite if the content script doesn't answer.
  await expect(popup.root).toHaveAttribute('aria-busy', 'false');
  await expect(popup.courseTitle).toBeVisible();
  await expect(popup.emptyCard).toBeHidden();
});

test('popup falls back to offsite when no content script answers', async ({
  context,
  extensionId,
}) => {
  const other = await context.newPage();
  await other.route('https://example.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html></html>' }),
  );
  await other.goto('https://example.com/');

  const tabId = await tabIdOf(context, other);
  const popup = await openPopup(await context.newPage(), extensionId, {
    tabId,
  });

  await expect(popup.root).toHaveAttribute('aria-busy', 'false');
  await expect(popup.emptyCard).toBeVisible();
  await expect(popup.youtubeButton).toBeDisabled();
});
