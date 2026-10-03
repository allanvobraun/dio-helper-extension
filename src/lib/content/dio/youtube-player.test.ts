// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lessonPageHtml } from './fixture.test-utils';
import { PLAYING, YoutubePlayer } from './youtube-player';

function iframe(id = 'ytc69') {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLIFrameElement)) throw new Error(`No iframe #${id}`);
  return el;
}

/** Simulates a message the YouTube embed posts to the page. */
function postFromPlayer(source: Window | null, data: unknown) {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: typeof data === 'string' ? data : JSON.stringify(data),
      source,
    }),
  );
}

describe('YoutubePlayer', () => {
  let player: YoutubePlayer;

  beforeEach(() => {
    document.body.innerHTML = lessonPageHtml();
    player = new YoutubePlayer();
  });

  afterEach(() => player.dispose());

  it('falls back to the player controls before the embed reports anything', () => {
    expect(player.current()).toMatchObject({
      videoId: 'fqKZZcLj2Ps',
      title: null,
      seconds: 78,
      duration: 1210,
    });
  });

  it('uses the time and video data the embed reports', () => {
    postFromPlayer(iframe().contentWindow, {
      event: 'infoDelivery',
      info: {
        currentTime: 95.5,
        duration: 1210.6,
        videoData: { video_id: 'fqKZZcLj2Ps', title: 'Real title' },
      },
    });

    expect(player.current()).toMatchObject({
      title: 'Real title',
      seconds: 95.5,
      duration: 1210.6,
    });
  });

  it('ignores messages from other windows and non-JSON data', () => {
    postFromPlayer(iframe('AWIN_CDT').contentWindow, {
      event: 'infoDelivery',
      info: { currentTime: 5 },
    });
    postFromPlayer(iframe().contentWindow, 'not json');

    expect(player.current()?.seconds).toBe(78);
  });

  it('notifies when a player starts playing, once per start', () => {
    const onPlaying = vi.fn();
    player.onPlaying(onPlaying);
    const source = iframe().contentWindow;

    postFromPlayer(source, { event: 'onStateChange', info: PLAYING });
    postFromPlayer(source, { event: 'infoDelivery', info: { playerState: 1 } });
    postFromPlayer(source, { event: 'onStateChange', info: 2 });
    postFromPlayer(source, { event: 'onStateChange', info: PLAYING });

    expect(onPlaying).toHaveBeenCalledTimes(2);
    expect(onPlaying).toHaveBeenCalledWith(iframe());
  });

  it('posts iframe API commands as JSON', () => {
    const target = iframe().contentWindow;
    if (!target) throw new Error('No contentWindow');
    const postMessage = vi.spyOn(target, 'postMessage');

    player.command(iframe(), 'setOption', ['captions', 'track', {}]);

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'command',
        func: 'setOption',
        args: ['captions', 'track', {}],
      }),
      '*',
    );
  });

  it('notifies when DIO swaps in a new player iframe', async () => {
    const onNewPlayer = vi.fn();
    player.onNewPlayer(onNewPlayer);

    const next = document.createElement('iframe');
    next.id = 'ytc70';
    next.src = 'https://www.youtube.com/embed/lessonVideo';
    iframe().replaceWith(next);
    await vi.waitFor(() => expect(onNewPlayer).toHaveBeenCalledWith(next));

    expect(player.current()?.videoId).toBe('lessonVideo');
  });
});
