import type { BrowserContext, Locator, Page } from '@playwright/test';

// The service worker's `chrome` global, as far as these tests use it.
declare const chrome: {
  tabs: { query(query: { active: true }): Promise<{ id?: number }[]> };
  action: { getBadgeText(details: object): Promise<string> };
};

export const LESSON_ID = '93b09cec-f92f-4810-ad1e-ff916216f022';
export const LESSON_URL = `https://web.dio.me/track/itau-java/course/era-da-ia/learning/${LESSON_ID}?autoplay=1`;
export const LESSON_TITLE = 'Como a Inteligência Artificial Nasceu';
export const COURSE_TITLE = 'Fundamentos da IA Moderna';
export const VIDEO_ID = 'fqKZZcLj2Ps';
export const INTRO_VIDEO_ID = 'VMnr_7Nw-UA';

export interface LessonStub {
  /** YouTube id in the player, or null for a lesson without a player. */
  videoId?: string | null;
  /** Clappr's on-screen position. */
  position?: string;
  duration?: string;
}

/** DIO's lesson grid rules (styled-components on the real page). */
const LESSON_GRID_CSS = `
  body { margin: 0; }
  .grid { display: grid; grid-template-columns: 1fr; background: black; }
  .grid > * { margin: 0; padding: 0 16px; }
  .grid > .stage { padding: 0; }
  [data-player], [data-player] iframe { display: block; width: 100%; height: 360px; border: 0; }
  @media (min-width: 768px) {
    .grid { grid-template-columns: 65fr 35fr; grid-template-rows: 4.5rem auto; }
  }
`;

/** Mirrors the real DIO lesson page structure (hashed classes omitted). */
function lessonHtml({
  videoId = VIDEO_ID,
  position = '01:18',
  duration = '20:10',
}: LessonStub) {
  const player =
    videoId === null
      ? ''
      : `<div data-player>
          <div data-container><div>
            <iframe id="ytc69" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"></iframe>
          </div></div>
          <div data-media-control>
            <div data-position>${position}</div>
            <div data-duration>${duration}</div>
          </div>
        </div>`;
  return `<!doctype html><html><head><meta charset="utf-8" /><title>DIO</title>
    <style>${LESSON_GRID_CSS}</style></head><body>
    <div id="root">
      <div class="grid">
        <div><span>${LESSON_TITLE}</span><span>${COURSE_TITLE}</span></div>
        <div class="aside">BASIC · XP 40/119</div>
        <div class="stage">${player}</div>
        <ul><li><ul>
          <li id="content-item-${LESSON_ID}"><div><span>${LESSON_TITLE}</span><span>20:11</span></div></li>
        </ul></li></ul>
      </div>
    </div>
  </body></html>`;
}

/** Stub YouTube embed: records the iframe API commands it receives. */
const EMBED_HTML = `<!doctype html><html><body><script>
  window.received = [];
  addEventListener('message', (event) => window.received.push(event.data));
</script></body></html>`;

/** Serves YouTube's embed and watch pages from stubs (no network). */
export async function stubYoutube(context: BrowserContext) {
  await context.route('https://www.youtube.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: EMBED_HTML }),
  );
}

/** Opens a stubbed DIO lesson and waits for the content script. */
export async function openDioLesson(
  context: BrowserContext,
  stub: LessonStub = {},
) {
  await stubYoutube(context);
  const page = await context.newPage();
  await page.route('https://web.dio.me/**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: lessonHtml(stub),
    }),
  );
  const contentReady = page.waitForEvent('console', {
    predicate: (msg) => msg.text() === 'Hello content.',
  });
  await page.goto(LESSON_URL);
  await contentReady;
  return {
    page,
    tabId: await tabIdOf(context, page),
    /** DIO's right column: the lesson list. */
    lessonList: page.locator('#root ul').first(),
    player: page.locator('[data-player]'),
    /** Rendered width of `locator` in CSS pixels. */
    async widthOf(locator: Locator) {
      return (await locator.boundingBox())?.width ?? 0;
    },
    /** Messages the stub YouTube embed has received, parsed. */
    async playerCommands(): Promise<unknown[]> {
      const frame = page.frame({ url: /youtube\.com\/embed/ });
      if (!frame) throw new Error('No YouTube embed frame');
      const received = await frame.evaluate(
        () => (window as unknown as { received: string[] }).received,
      );
      return received.map((data) => JSON.parse(data));
    },
  };
}

/** Opens a page where the content script doesn't run. */
export async function openOtherSite(context: BrowserContext) {
  const page = await context.newPage();
  await page.route('https://example.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html></html>' }),
  );
  await page.goto('https://example.com/');
  return { page, tabId: await tabIdOf(context, page) };
}

async function serviceWorkerOf(context: BrowserContext) {
  const [serviceWorker] = context.serviceWorkers();
  return serviceWorker ?? context.waitForEvent('serviceworker');
}

/**
 * Browser tab id of `page`. The extension has no `tabs` permission, so tabs
 * can't be queried by URL: bring the page to the front and read the active tab.
 */
export async function tabIdOf(context: BrowserContext, page: Page) {
  await page.bringToFront();
  const serviceWorker = await serviceWorkerOf(context);
  const tabId = await serviceWorker.evaluate(
    async () => (await chrome.tabs.query({ active: true }))[0]?.id,
  );
  if (tabId === undefined) throw new Error(`No tab found for ${page.url()}`);
  return tabId;
}

/** The extension's toolbar badge text. */
export async function badgeText(context: BrowserContext) {
  const serviceWorker = await serviceWorkerOf(context);
  return serviceWorker.evaluate(() => chrome.action.getBadgeText({}));
}
