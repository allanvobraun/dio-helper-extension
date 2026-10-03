import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { syncBadge } from './badge';

describe('syncBadge', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  function spyOnAction() {
    vi.spyOn(browser.runtime, 'getManifest').mockReturnValue({
      manifest_version: 3,
      name: 'DIO Helper',
      version: '0.0.0',
    });
    return {
      text: vi.spyOn(browser.action, 'setBadgeText').mockResolvedValue(),
      color: vi
        .spyOn(browser.action, 'setBadgeBackgroundColor')
        .mockResolvedValue(),
      title: vi.spyOn(browser.action, 'setTitle').mockResolvedValue(),
    };
  }

  it('shows OFF while subtitles are hidden', async () => {
    const action = spyOnAction();
    await syncBadge(true);

    expect(action.text).toHaveBeenCalledWith({ text: 'OFF' });
    expect(action.title).toHaveBeenCalledWith({
      title: 'DIO Helper: legendas ocultas',
    });
  });

  it('clears the badge when subtitles are shown', async () => {
    const action = spyOnAction();
    await syncBadge(false);

    expect(action.text).toHaveBeenCalledWith({ text: '' });
    expect(action.title).toHaveBeenCalledWith({ title: 'DIO Helper' });
  });
});
