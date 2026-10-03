import { expect, test } from './fixtures';

test('content script runs on matching pages', async ({ page }) => {
  // Serve a stub so the test doesn't depend on the real google.com.
  await page.route('https://www.google.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><body>stub</body></html>',
    }),
  );

  const message = page.waitForEvent('console', {
    predicate: (msg) => msg.text() === 'Hello content.',
  });
  await page.goto('https://www.google.com/');
  await expect(message).resolves.toBeTruthy();
});
