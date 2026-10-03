/** Hide the auto-generated subtitles on every DIO lesson video. */
export const hideSubtitles = storage.defineItem<boolean>('sync:hideSubtitles', {
  fallback: false,
});

/** Widen the lesson video and collapse DIO's right column (YouTube-style). */
export const theaterMode = storage.defineItem<boolean>('sync:theaterMode', {
  fallback: false,
});
