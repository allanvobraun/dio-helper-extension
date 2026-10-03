import { findPlayerIframe, readClapprTime, videoIdFromIframe } from './dom';

/** YouTube's `playerState` value while a video plays. */
export const PLAYING = 1;

export interface PlayerSnapshot {
  iframe: HTMLIFrameElement;
  videoId: string;
  /** YouTube's title, known once the player reported it. */
  title: string | null;
  seconds: number;
  duration: number;
}

interface PlayerInfo {
  currentTime?: number;
  duration?: number;
  playerState?: number;
  title?: string;
  videoId?: string;
}

type PlayerListener = (iframe: HTMLIFrameElement) => void;

/**
 * Talks to the YouTube embed inside DIO's player through `postMessage`, the
 * protocol the iframe API uses, so it works from the isolated content script.
 *
 * The iframe posts `infoDelivery` / `onStateChange` messages to the page while
 * it plays (DIO's own player subscribed to them); this class caches them per
 * iframe. Clappr's on-screen clock is the fallback when none arrived yet.
 */
export class YoutubePlayer {
  readonly #info = new WeakMap<HTMLIFrameElement, PlayerInfo>();
  readonly #newPlayerListeners = new Set<PlayerListener>();
  readonly #playingListeners = new Set<PlayerListener>();
  readonly #observer: MutationObserver;
  #lastIframe: HTMLIFrameElement | null;

  constructor(private readonly doc: Document = document) {
    this.#lastIframe = findPlayerIframe(doc);
    this.#observer = new MutationObserver(() => this.#checkForNewPlayer());
    this.#observer.observe(doc.documentElement, {
      childList: true,
      subtree: true,
    });
    doc.defaultView?.addEventListener('message', this.#onMessage);
  }

  /** The current player's video and position, or null without a player. */
  current(): PlayerSnapshot | null {
    const iframe = findPlayerIframe(this.doc);
    if (!iframe) return null;
    const info = this.#info.get(iframe) ?? {};
    const videoId = info.videoId ?? videoIdFromIframe(iframe);
    if (!videoId) return null;
    const clock = readClapprTime(this.doc);
    return {
      iframe,
      videoId,
      title: info.title ?? null,
      seconds: info.currentTime ?? clock?.seconds ?? 0,
      duration: info.duration || clock?.duration || 0,
    };
  }

  /** Sends an iframe API command (`setOption`, `pauseVideo`, …) to `iframe`. */
  command(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*',
    );
  }

  /** Calls `listener` whenever DIO swaps in a new player iframe. */
  onNewPlayer(listener: PlayerListener): () => void {
    this.#newPlayerListeners.add(listener);
    return () => this.#newPlayerListeners.delete(listener);
  }

  /** Calls `listener` each time a player reports it started playing. */
  onPlaying(listener: PlayerListener): () => void {
    this.#playingListeners.add(listener);
    return () => this.#playingListeners.delete(listener);
  }

  dispose() {
    this.#observer.disconnect();
    this.doc.defaultView?.removeEventListener('message', this.#onMessage);
    this.#newPlayerListeners.clear();
    this.#playingListeners.clear();
  }

  #checkForNewPlayer() {
    const iframe = findPlayerIframe(this.doc);
    if (!iframe || iframe === this.#lastIframe) return;
    this.#lastIframe = iframe;
    for (const listener of this.#newPlayerListeners) listener(iframe);
  }

  readonly #onMessage = (event: MessageEvent) => {
    const iframe = findPlayerIframe(this.doc);
    if (!iframe || event.source !== iframe.contentWindow) return;
    const message = parseMessage(event.data);
    if (!message) return;

    const info = this.#info.get(iframe) ?? {};
    const wasPlaying = info.playerState === PLAYING;
    if (message.event === 'onStateChange' && typeof message.info === 'number') {
      info.playerState = message.info;
    } else if (message.event === 'infoDelivery' && isRecord(message.info)) {
      const data = message.info;
      if (typeof data.currentTime === 'number')
        info.currentTime = data.currentTime;
      if (typeof data.duration === 'number') info.duration = data.duration;
      if (typeof data.playerState === 'number')
        info.playerState = data.playerState;
      if (isRecord(data.videoData)) {
        if (typeof data.videoData.title === 'string')
          info.title = data.videoData.title;
        if (typeof data.videoData.video_id === 'string')
          info.videoId = data.videoData.video_id;
      }
    } else {
      return;
    }
    this.#info.set(iframe, info);

    if (!wasPlaying && info.playerState === PLAYING) {
      for (const listener of this.#playingListeners) listener(iframe);
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseMessage(data: unknown): { event: unknown; info: unknown } | null {
  if (typeof data !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(data);
    return isRecord(parsed) ? { event: parsed.event, info: parsed.info } : null;
  } catch {
    return null;
  }
}
