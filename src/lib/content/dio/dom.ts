// Read-only helpers over DIO's lesson page DOM. The page's class names are
// hashed (styled-components), so these anchor on ids, data attributes and text.

export interface ClockTime {
  seconds: number;
  duration: number;
}

/** The lesson id in `/learning/<id>`, or null off a lesson page. */
export function lessonIdFromUrl(url: string): string | null {
  const { pathname } = new URL(url);
  return pathname.match(/\/learning\/([^/]+)/)?.[1] ?? null;
}

/** Parses `mm:ss` or `h:mm:ss` into seconds, or null. */
export function parseClock(text: string | null | undefined): number | null {
  const parts = text?.trim().split(':') ?? [];
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((part) => /^\d+$/.test(part))) return null;
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
}

function text(el: Element | null | undefined): string | null {
  const value = el?.textContent?.trim();
  return value ? value : null;
}

/** The lesson title from its item in the lesson list (first span). */
export function readLessonTitle(
  lessonId: string,
  root: ParentNode = document,
): string | null {
  const item = root.querySelector(
    `li[id="content-item-${CSS.escape(lessonId)}"]`,
  );
  return text(item?.querySelector('span'));
}

/** The lesson's duration in seconds, as listed next to its title (`20:11`). */
export function readLessonDuration(
  lessonId: string,
  root: ParentNode = document,
): number | null {
  const item = root.querySelector(
    `li[id="content-item-${CSS.escape(lessonId)}"]`,
  );
  const [, duration] = item?.querySelectorAll('span') ?? [];
  return parseClock(text(duration));
}

/**
 * The course name: in the page header it's the span right after the one with
 * the lesson title.
 */
export function readCourseTitle(
  lessonTitle: string,
  root: ParentNode = document,
): string | null {
  for (const span of root.querySelectorAll('span')) {
    if (span.closest('li[id^="content-item-"]')) continue;
    if (text(span) !== lessonTitle) continue;
    const next = span.nextElementSibling;
    if (next?.tagName === 'SPAN') return text(next);
  }
  return null;
}

/** The YouTube iframe inside DIO's Clappr player. Its id changes per video. */
export function findPlayerIframe(
  root: ParentNode = document,
): HTMLIFrameElement | null {
  return root.querySelector<HTMLIFrameElement>(
    '[data-player] iframe[id^="ytc"]',
  );
}

/** The YouTube video id from an embed URL (`/embed/<id>`). */
export function videoIdFromIframe(iframe: HTMLIFrameElement): string | null {
  try {
    return new URL(iframe.src).pathname.match(/\/embed\/([\w-]+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Position and duration as shown by Clappr's controls (second precision). */
export function readClapprTime(root: ParentNode = document): ClockTime | null {
  const seconds = parseClock(
    text(root.querySelector('[data-player] [data-position]')),
  );
  const duration = parseClock(
    text(root.querySelector('[data-player] [data-duration]')),
  );
  if (seconds === null || duration === null) return null;
  return { seconds, duration };
}
