import { hideSubtitles } from '../../settings';
import type { YoutubePlayer } from '../dio/youtube-player';

/** Track that brings DIO's Portuguese auto-captions back. */
export const CAPTIONS_TRACK = { languageCode: 'pt' };

type SubtitlesSetting = Pick<typeof hideSubtitles, 'getValue' | 'watch'>;
type Player = Pick<
  YoutubePlayer,
  'current' | 'command' | 'onNewPlayer' | 'onPlaying'
>;

/**
 * Applies the `hideSubtitles` setting to DIO's YouTube player: on start, when
 * the setting changes, and for every new player (each lesson, and the lesson
 * after the intro). Captions load when playback starts, so a player is hidden
 * again the first time it plays.
 */
export class SubtitlesController {
  readonly #player: Player;
  readonly #hidden = new Set<HTMLIFrameElement>();
  readonly #hiddenOnPlay = new WeakSet<HTMLIFrameElement>();
  readonly #cleanups: (() => void)[] = [];
  #hide = false;

  constructor(player: Player, setting: SubtitlesSetting = hideSubtitles) {
    this.#player = player;
    this.#cleanups.push(
      setting.watch((hide) => this.#apply(hide)),
      player.onNewPlayer((iframe) => {
        if (this.#hide) this.#hideOn(iframe);
      }),
      player.onPlaying((iframe) => {
        if (!this.#hide || this.#hiddenOnPlay.has(iframe)) return;
        this.#hiddenOnPlay.add(iframe);
        this.#hideOn(iframe);
      }),
    );
    void setting.getValue().then((hide) => this.#apply(hide));
  }

  dispose() {
    for (const cleanup of this.#cleanups) cleanup();
  }

  #apply(hide: boolean) {
    this.#hide = hide;
    if (hide) {
      const iframe = this.#player.current()?.iframe;
      if (iframe) this.#hideOn(iframe);
      return;
    }
    for (const iframe of this.#hidden) {
      if (iframe.isConnected) {
        this.#player.command(iframe, 'setOption', [
          'captions',
          'track',
          CAPTIONS_TRACK,
        ]);
      }
    }
    this.#hidden.clear();
  }

  #hideOn(iframe: HTMLIFrameElement) {
    this.#hidden.add(iframe);
    this.#player.command(iframe, 'setOption', ['captions', 'track', {}]);
  }
}
