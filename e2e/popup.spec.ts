import { expect, test } from './fixtures';
import { openPopup } from './pages/popup';

test('popup renders and the counter increments', async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup(page, extensionId);

  await expect(popup.heading).toBeVisible();
  await expect(popup.counter).toHaveText('count is 0');

  await popup.counter.click();
  await expect(popup.counter).toHaveText('count is 1');

  await popup.counter.click();
  await expect(popup.counter).toHaveText('count is 2');
});
