import { expect, test } from './fixtures';
import { openDioLesson } from './pages/dio';
import { openPopup } from './pages/popup';

const VIEWPORT = { width: 1280, height: 720 };

test('theater switch widens the video and collapses the lesson list', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  await dio.page.setViewportSize(VIEWPORT);
  const playerWidth = () => dio.widthOf(dio.player);
  const listWidth = () => dio.widthOf(dio.lessonList);

  // DIO's own layout: 65% video, 35% lessons.
  await expect.poll(playerWidth).toBeCloseTo(VIEWPORT.width * 0.65, -1);

  const page = await context.newPage();
  let popup = await openPopup(page, extensionId, dio.tabId);
  await expect(popup.theaterSwitch).toHaveAttribute('aria-checked', 'false');
  await expect(popup.theaterOn).toBeHidden();

  await popup.theaterSwitch.click();
  await expect(popup.theaterSwitch).toHaveAttribute('aria-checked', 'true');
  await expect(popup.theaterOn).toBeVisible();
  await expect.poll(playerWidth).toBe(VIEWPORT.width);
  await expect.poll(listWidth).toBe(0);
  await expect(dio.lessonList).toBeHidden();

  popup = await openPopup(page, extensionId, dio.tabId);
  await expect(popup.theaterSwitch).toHaveAttribute('aria-checked', 'true');

  await popup.theaterSwitch.click();
  await expect.poll(playerWidth).toBeCloseTo(VIEWPORT.width * 0.65, -1);
  await expect(dio.lessonList).toBeVisible();
});

test('T on the lesson page toggles theater mode', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  await dio.page.setViewportSize(VIEWPORT);

  await dio.page.keyboard.press('t');
  await expect.poll(() => dio.widthOf(dio.player)).toBe(VIEWPORT.width);

  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );
  await expect(popup.theaterSwitch).toHaveAttribute('aria-checked', 'true');

  await dio.page.bringToFront();
  await dio.page.keyboard.press('t');
  await expect(dio.lessonList).toBeVisible();
});

test('T typed into a text field does not toggle theater mode', async ({
  context,
}) => {
  const dio = await openDioLesson(context);
  await dio.page.setViewportSize(VIEWPORT);
  await dio.page.evaluate(() => {
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Comentário');
    document.body.append(input);
  });

  await dio.page.getByRole('textbox', { name: 'Comentário' }).press('t');

  await expect(dio.lessonList).toBeVisible();
  expect(await dio.widthOf(dio.lessonList)).toBeGreaterThan(0);
});

test('narrow (mobile) layout is left alone', async ({ context }) => {
  const dio = await openDioLesson(context);
  await dio.page.setViewportSize({ width: 600, height: 800 });

  await dio.page.keyboard.press('t');
  await expect
    .poll(() =>
      dio.page.evaluate(() =>
        document.documentElement.hasAttribute('data-dio-helper-theater'),
      ),
    )
    .toBe(true);

  await expect(dio.lessonList).toBeVisible();
  expect(await dio.widthOf(dio.lessonList)).toBe(600);
});
