/** Hide the auto-generated subtitles on every DIO lesson video. */
export const hideSubtitles = storage.defineItem<boolean>('sync:hideSubtitles', {
  fallback: false,
});
