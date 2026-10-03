const HIDDEN_TITLE = 'DIO Helper: legendas ocultas';

/** Shows an "OFF" badge on the toolbar icon while subtitles are hidden. */
export async function syncBadge(subtitlesHidden: boolean) {
  await Promise.all([
    browser.action.setBadgeText({ text: subtitlesHidden ? 'OFF' : '' }),
    browser.action.setBadgeBackgroundColor({ color: '#e4105d' }),
    browser.action.setTitle({
      title: subtitlesHidden
        ? HIDDEN_TITLE
        : browser.runtime.getManifest().name,
    }),
  ]);
}
