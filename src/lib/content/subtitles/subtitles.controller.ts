import { onSetting, type Setting, showSubtitles } from '../../settings';
import type { YoutubePlayer } from '../dio/youtube-player';

/** Track that brings DIO's Portuguese auto-captions back. */
export const CAPTIONS_TRACK = { languageCode: 'pt' };

type Player = Pick<
  YoutubePlayer,
  'current' | 'command' | 'onNewPlayer' | 'onPlaying'
>;

/**
 * Keeps DIO's YouTube players in sync with the `showSubtitles` setting
 * (subtitles off by default): on start, whenever the setting changes, and for
 * every new player (each lesson, and the lesson after the intro). Captions
 * load when playback starts, so each player is synced again the first time it
 * plays.
 */
export class SubtitlesController {
  readonly #player: Player;
  readonly #players = new Set<HTMLIFrameElement>();
  readonly #syncedOnPlay = new WeakSet<HTMLIFrameElement>();
  readonly #cleanups: (() => void)[] = [];
  #show = false;

  constructor(
    player: Player,
    subtitleSettingStorageSync: Setting<boolean> = showSubtitles,
  ) {
    this.#player = player;
    this.#cleanups.push(
      onSetting(subtitleSettingStorageSync, (show) => this.#apply(show)),
      player.onNewPlayer((iframe) => this.#sync(iframe)),
      player.onPlaying((iframe) => {
        if (this.#syncedOnPlay.has(iframe)) return;
        this.#syncedOnPlay.add(iframe);
        this.#sync(iframe);
      }),
    );
  }

  dispose() {
    for (const cleanup of this.#cleanups) cleanup();
  }

  #apply(show: boolean) {
    this.#show = show;
    const current = this.#player.current()?.iframe;
    if (current) this.#players.add(current);
    for (const iframe of this.#players) {
      if (iframe.isConnected) this.#sync(iframe);
      else this.#players.delete(iframe);
    }
  }

  #sync(iframe: HTMLIFrameElement) {
    this.#players.add(iframe);
    this.#player.command(iframe, 'setOption', [
      'captions',
      'track',
      this.#show ? CAPTIONS_TRACK : {},
    ]);
  }
}
