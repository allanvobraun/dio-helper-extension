import { theaterMode } from '../../settings';
import { THEATER_ATTR, THEATER_CSS, THEATER_STYLE_ID } from './theater.styles';

type TheaterSetting = Pick<
  typeof theaterMode,
  'getValue' | 'watch' | 'setValue'
>;

/** Keyboard shortcut, as on YouTube. */
export const THEATER_KEY = 't';

/**
 * Applies the `theaterMode` setting to DIO's lesson layout and toggles it with
 * the `t` key. The layout itself is pure CSS keyed on an attribute of `<html>`
 * (see `theater.styles.ts`), so it survives DIO re-rendering the page.
 *
 * Keys pressed while the YouTube iframe has focus go to the iframe and never
 * reach this page, so the shortcut only works after clicking outside the video.
 */
export class TheaterController {
  readonly #setting: TheaterSetting;
  readonly #doc: Document;
  readonly #style: HTMLStyleElement;
  readonly #unwatch: () => void;
  #on = false;

  constructor(setting: TheaterSetting = theaterMode, doc = document) {
    this.#setting = setting;
    this.#doc = doc;
    this.#style = doc.createElement('style');
    this.#style.id = THEATER_STYLE_ID;
    this.#style.textContent = THEATER_CSS;
    doc.head.append(this.#style);

    this.#unwatch = setting.watch((on) => this.#apply(on));
    doc.addEventListener('keydown', this.#onKeydown);
    void setting.getValue().then((on) => this.#apply(on));
  }

  dispose() {
    this.#unwatch();
    this.#doc.removeEventListener('keydown', this.#onKeydown);
    this.#style.remove();
    this.#doc.documentElement.removeAttribute(THEATER_ATTR);
  }

  #apply(on: boolean) {
    this.#on = on;
    this.#doc.documentElement.toggleAttribute(THEATER_ATTR, on);
  }

  readonly #onKeydown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() !== THEATER_KEY) return;
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isEditable(event.target)) return;
    if (!this.#doc.querySelector('[data-player]')) return;
    void this.#setting.setValue(!this.#on);
  };
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"]',
    ) !== null
  );
}
