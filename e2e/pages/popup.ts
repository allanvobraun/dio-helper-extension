import type { Page } from '@playwright/test';

/** Page object for the extension popup. Keeps selectors out of the specs. */
export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  return {
    heading: page.getByRole('heading', { name: 'WXT + Svelte' }),
    counter: page.getByRole('button', { name: /count is/ }),
  };
}
