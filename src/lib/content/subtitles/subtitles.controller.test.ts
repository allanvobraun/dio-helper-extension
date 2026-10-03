// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { hideSubtitles } from '../../settings';
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

  it('does nothing when subtitles are shown at startup', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();

    expect(player.command).not.toHaveBeenCalled();
  });

  it('hides captions on the current player at startup', async () => {
    await hideSubtitles.setValue(true);
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();

    expect(player.command).toHaveBeenCalledWith(
      player.iframe,
      'setOption',
      HIDE,
    );
  });

  it('hides captions when the setting is turned on', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();

    await hideSubtitles.setValue(true);
    await settle();

    expect(player.command).toHaveBeenCalledWith(
      player.iframe,
      'setOption',
      HIDE,
    );
  });

  it('hides captions on new players and again on their first play', async () => {
    await hideSubtitles.setValue(true);
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

  it('restores captions only on players it hid', async () => {
    const player = fakePlayer();
    new SubtitlesController(player);
    await settle();
    const hidden = player.iframe;

    await hideSubtitles.setValue(true);
    await settle();
    // A player that appears while subtitles are shown is never touched.
    const later = document.createElement('iframe');
    document.body.append(later);
    await hideSubtitles.setValue(false);
    await settle();
    player.emitNewPlayer(later);

    const calls = player.command.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls.every(([target]) => target === hidden)).toBe(true);
    expect(calls.map(([, func, args]) => [func, args])).toEqual([
      ['setOption', HIDE],
      ['setOption', SHOW],
    ]);
  });

  it('stops reacting after dispose', async () => {
    const player = fakePlayer();
    const controller = new SubtitlesController(player);
    await settle();
    controller.dispose();

    await hideSubtitles.setValue(true);
    await settle();

    expect(player.command).not.toHaveBeenCalled();
  });
});
