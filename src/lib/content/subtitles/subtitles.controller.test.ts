// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { showSubtitles } from '../../settings';
import { CAPTIONS_TRACK, SubtitlesController } from './subtitles.controller';

const HIDE = ['captions', 'track', {}];
const SHOW = ['captions', 'track', CAPTIONS_TRACK];

function fakePlayer() {
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  const newPlayer = new Set<(iframe: HTMLIFrameElement) => void>();
  const playing = new Set<(iframe: HTMLIFrameElement) => void>();
  const player = {
    iframe,
    current: vi.fn(() => ({
      iframe: player.iframe,
      videoId: 'fqKZZcLj2Ps',
      title: null,
      seconds: 0,
      duration: 0,
    })),
    command: vi.fn(),
    onNewPlayer: (listener: (iframe: HTMLIFrameElement) => void) => {
      newPlayer.add(listener);
      return () => newPlayer.delete(listener);
    },
    onPlaying: (listener: (iframe: HTMLIFrameElement) => void) => {
      playing.add(listener);
      return () => playing.delete(listener);
    },
    emitNewPlayer(next: HTMLIFrameElement) {
      player.iframe = next;
      for (const listener of newPlayer) listener(next);
    },
    emitPlaying(target: HTMLIFrameElement) {
      for (const listener of playing) listener(target);
    },
  };
  return player;
}

/** Lets the controller's initial `getValue()` and storage watchers settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('SubtitlesController', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
  });

  it('turns captions off on the current player by default', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();

    expect(player.command.mock.calls).toEqual([
      [player.iframe, 'setOption', HIDE],
    ]);
  });

  it('turns captions on at startup when the user chose them', async () => {
    await showSubtitles.setValue(true);
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();

    expect(player.command).toHaveBeenLastCalledWith(
      player.iframe,
      'setOption',
      SHOW,
    );
  });

  it('follows the setting both ways', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();
    player.command.mockClear();

    await showSubtitles.setValue(true);
    await settle();
    await showSubtitles.setValue(false);
    await settle();

    expect(player.command.mock.calls).toEqual([
      [player.iframe, 'setOption', SHOW],
      [player.iframe, 'setOption', HIDE],
    ]);
  });

  it('syncs new players, and again on their first play', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();
    player.command.mockClear();

    const next = document.createElement('iframe');
    document.body.append(next);
    player.emitNewPlayer(next);
    player.emitPlaying(next);
    player.emitPlaying(next);

    expect(player.command.mock.calls).toEqual([
      [next, 'setOption', HIDE],
      [next, 'setOption', HIDE],
    ]);
  });

  it('syncs every player still on the page when the setting changes', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();
    const first = player.iframe;
    const next = document.createElement('iframe');
    document.body.append(next);
    player.emitNewPlayer(next);
    first.remove();
    player.command.mockClear();

    await showSubtitles.setValue(true);
    await settle();

    expect(player.command.mock.calls).toEqual([[next, 'setOption', SHOW]]);
  });

  it('stops reacting after dispose', async () => {
    const player = fakePlayer();
    const controller = new SubtitlesController(player);
    await settle();
    controller.dispose();
    player.command.mockClear();

    await showSubtitles.setValue(true);
    await settle();
    player.emitPlaying(player.iframe);

    expect(player.command).not.toHaveBeenCalled();
  });
});
