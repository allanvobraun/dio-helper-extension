import { expect, test } from './fixtures';
import {
  INTRO_VIDEO_ID,
  LESSON_TITLE,
  openDioLesson,
  openOtherSite,
} from './pages/dio';
import { openPopup } from './pages/popup';

test('shows the current lesson and video progress', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  await expect(popup.heading).toBeVisible();
  await expect(popup.lessonTitle).toHaveText(LESSON_TITLE);
  await expect(popup.courseTitle).toBeVisible();
  // 01:18 of 20:10.
  await expect(popup.progress).toHaveAttribute('aria-valuenow', '6');
  await expect(popup.youtubeButton).toBeEnabled();
  await expect(popup.youtubeButton).toContainText('1:18');
});

test('subtitles switch is remembered between popups', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  const page = await context.newPage();
  let popup = await openPopup(page, extensionId, dio.tabId);

  await expect(popup.subtitlesSwitch).toHaveAttribute('aria-checked', 'false');
  await expect(popup.subtitlesHidden).toBeHidden();

  await popup.subtitlesSwitch.click();
  await expect(popup.subtitlesSwitch).toHaveAttribute('aria-checked', 'true');
  await expect(popup.subtitlesHidden).toBeVisible();

  popup = await openPopup(page, extensionId, dio.tabId);
  await expect(popup.subtitlesSwitch).toHaveAttribute('aria-checked', 'true');

  await popup.subtitlesSwitch.click();
  await expect(popup.subtitlesHidden).toBeHidden();
});

test('off DIO shows the empty card and disables YouTube', async ({
  context,
  extensionId,
}) => {
  const other = await openOtherSite(context);
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    other.tabId,
  );

  await expect(popup.emptyCard).toBeVisible();
  await expect(popup.goToDio).toBeVisible();
  await expect(popup.progress).toBeHidden();
  await expect(popup.youtubeButton).toBeDisabled();
});

test('lesson without a YouTube video shows a notice', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context, { videoId: null });
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  await expect(popup.lessonTitle).toHaveText(LESSON_TITLE);
  await expect(popup.noVideoNotice).toBeVisible();
  await expect(popup.youtubeButton).toBeDisabled();
});

test('the DIO intro is not offered as the lesson video', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context, { videoId: INTRO_VIDEO_ID });
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  await expect(popup.noVideoNotice).toBeVisible();
  await expect(popup.youtubeButton).toBeDisabled();
});

test('error state offers a retry when the video is gone', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  await dio.page.evaluate(() =>
    document.querySelector('[data-player]')?.remove(),
  );
  await popup.youtubeButton.click();

  await expect(popup.errorNotice).toBeVisible();
  await expect(popup.youtubeButton).toHaveText(/Tentar novamente/);
  await expect(popup.youtubeButton).toBeEnabled();
});
