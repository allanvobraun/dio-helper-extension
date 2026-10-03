import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { onSetting, showSubtitles } from './settings';

/** Lets `getValue()` and storage watchers settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('onSetting', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('applies the stored value, then every change', async () => {
    await showSubtitles.setValue(true);
    const apply = vi.fn();
    onSetting(showSubtitles, apply);
    await settle();

    await showSubtitles.setValue(false);
    await settle();

    expect(apply.mock.calls).toEqual([[true], [false]]);
  });

  it('applies the fallback when nothing is stored', async () => {
    const apply = vi.fn();
    onSetting(showSubtitles, apply);
    await settle();

    expect(apply.mock.calls).toEqual([[false]]);
  });

  it('stops applying changes once unwatched', async () => {
    const apply = vi.fn();
    const unwatch = onSetting(showSubtitles, apply);
    await settle();
    unwatch();

    await showSubtitles.setValue(true);
    await settle();

    expect(apply.mock.calls).toEqual([[false]]);
  });
});
