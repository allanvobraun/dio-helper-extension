import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { ContentMessageError, sendToActiveTab } from './active-tab';

describe('sendToActiveTab', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    vi.stubGlobal('location', new URL('chrome-extension://test/popup.html'));
  });

  it('rejects with a "no-tab" error when there is no active tab', async () => {
    const result = sendToActiveTab('ping');

    await expect(result).rejects.toBeInstanceOf(ContentMessageError);
    await expect(result).rejects.toMatchObject({ code: 'no-tab' });
  });
});
