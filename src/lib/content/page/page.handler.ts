export interface PageInfo {
  url: string;
  title: string;
}

/** Generic page actions, available on every page the content script runs on. */
export class PageHandler {
  /** Health check: resolves when a content script is listening in the tab. */
  ping() {
    return 'pong' as const;
  }

  getPageInfo(): PageInfo {
    return { url: location.href, title: this.#title() };
  }

  #title() {
    return document.title.trim();
  }
}
