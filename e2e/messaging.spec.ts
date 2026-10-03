import { expect, test } from './fixtures';
import { badgeText, openDioLesson, VIDEO_ID } from './pages/dio';
import { openPopup } from './pages/popup';

const HIDE = {
  event: 'command',
  func: 'setOption',
  args: ['captions', 'track', {}],
};
const SHOW = {
  event: 'command',
  func: 'setOption',
  args: ['captions', 'track', { languageCode: 'pt' }],
};

test('opens the lesson video on YouTube where the user stopped', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  const youtube = context.waitForEvent('page', {
    predicate: (page) => page.url().startsWith('https://www.youtube.com/watch'),
  });
  await popup.youtubeButton.click();

  await expect(youtube).resolves.toHaveURL(
    `https://www.youtube.com/watch?v=${VIDEO_ID}&t=78s`,
  );
});

test('hiding subtitles commands the player and sets the badge', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  await popup.subtitlesSwitch.click();
  await expect.poll(() => dio.playerCommands()).toContainEqual(HIDE);
  await expect.poll(() => badgeText(context)).toBe('OFF');

  await popup.subtitlesSwitch.click();
  await expect.poll(() => dio.playerCommands()).toContainEqual(SHOW);
  await expect.poll(() => badgeText(context)).toBe('');
});
