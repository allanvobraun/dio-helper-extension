import { expect, test } from './fixtures';
import { openPopup } from './pages/popup';

test('shows the current course on a lesson', async ({ page, extensionId }) => {
  const popup = await openPopup(page, extensionId);

  await expect(popup.heading).toBeVisible();
  await expect(popup.courseTitle).toBeVisible();
  await expect(popup.progress).toHaveAttribute('aria-valuenow', '38');
  await expect(popup.youtubeButton).toBeEnabled();
  await expect(popup.youtubeButton).toContainText('12:48');
});

test('subtitles switch toggles the confirmation line', async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup(page, extensionId);

  await expect(popup.subtitlesSwitch).toHaveAttribute('aria-checked', 'false');
  await expect(popup.subtitlesHidden).toBeHidden();

  await popup.subtitlesSwitch.click();
  await expect(popup.subtitlesSwitch).toHaveAttribute('aria-checked', 'true');
  await expect(popup.subtitlesHidden).toBeVisible();

  await popup.subtitlesSwitch.click();
  await expect(popup.subtitlesHidden).toBeHidden();
});

test('off DIO shows the empty card and disables YouTube', async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup(page, extensionId, 'offsite');

  await expect(popup.emptyCard).toBeVisible();
  await expect(popup.goToDio).toBeVisible();
  await expect(popup.courseTitle).toBeHidden();
  await expect(popup.youtubeButton).toBeDisabled();
});

test('lesson without a YouTube video shows a notice', async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup(page, extensionId, 'noyt');

  await expect(popup.noVideoNotice).toBeVisible();
  await expect(popup.youtubeButton).toBeDisabled();
});

test('opening in YouTube shows the loading state', async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup(page, extensionId);

  await popup.youtubeButton.click();
  await expect(popup.youtubeButton).toHaveText(/Abrindo no YouTube…/);
  await expect(popup.youtubeButton).toBeDisabled();
});

test('error state offers a retry', async ({ page, extensionId }) => {
  const popup = await openPopup(page, extensionId, 'error');

  await expect(popup.errorNotice).toBeVisible();
  await expect(popup.youtubeButton).toHaveText(/Tentar novamente/);
  await expect(popup.youtubeButton).toBeEnabled();
});
