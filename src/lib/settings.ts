/**
 * Show the auto-generated subtitles on DIO lesson videos. Off unless the user
 * turns them on in the popup.
 */
export const showSubtitles = storage.defineItem<boolean>('sync:showSubtitles', {
  fallback: false,
});

/** Widen the lesson video and collapse DIO's right column (YouTube-style). */
export const theaterMode = storage.defineItem<boolean>('sync:theaterMode', {
  fallback: false,
});

/** The part of a storage item `onSetting` needs (fakes in tests too). */
export interface Setting<T> {
  getValue(): Promise<T>;
  watch(callback: (value: T) => void): () => void;
}

/**
 * Calls `apply` with the setting's stored value, then again on every change.
 * Returns the function that stops watching.
 */
export function onSetting<T>(
  setting: Setting<T>,
  apply: (value: T) => void,
): () => void {
  void setting.getValue().then(apply);
  return setting.watch((value) => apply(value));
}
