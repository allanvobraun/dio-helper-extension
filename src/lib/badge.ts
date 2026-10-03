const SHOWN_TITLE = 'DIO Helper: legendas ativadas';

/** Shows a "CC" badge on the toolbar icon while subtitles are on. */
export async function syncBadge(subtitlesShown: boolean) {
  await Promise.all([
    browser.action.setBadgeText({ text: subtitlesShown ? 'CC' : '' }),
    browser.action.setBadgeBackgroundColor({ color: '#e4105d' }),
    browser.action.setTitle({
      title: subtitlesShown ? SHOWN_TITLE : browser.runtime.getManifest().name,
    }),
  ]);
}
