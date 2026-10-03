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

test('subtitles are off by default and the switch syncs the player and badge', async ({
  context,
  extensionId,
}) => {
  const dio = await openDioLesson(context);
  await expect.poll(() => dio.playerCommands()).toEqual([HIDE]);
  await expect.poll(() => badgeText(context)).toBe('');

  const popup = await openPopup(
    await context.newPage(),
    extensionId,
    dio.tabId,
  );

  await popup.subtitlesSwitch.click();
  await expect.poll(() => dio.playerCommands()).toEqual([HIDE, SHOW]);
  await expect.poll(() => badgeText(context)).toBe('CC');

  await popup.subtitlesSwitch.click();
  await expect.poll(() => dio.playerCommands()).toEqual([HIDE, SHOW, HIDE]);
  await expect.poll(() => badgeText(context)).toBe('');
});
