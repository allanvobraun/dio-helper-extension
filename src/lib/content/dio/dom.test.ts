// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  findPlayerIframe,
  lessonIdFromUrl,
  parseClock,
  readClapprTime,
  readCourseTitle,
  readLessonDuration,
  readLessonTitle,
  videoIdFromIframe,
} from './dom';
import {
  COURSE_TITLE,
  LESSON_ID,
  LESSON_TITLE,
  LESSON_URL,
  lessonPageHtml,
} from './fixture.test-utils';

describe('lessonIdFromUrl', () => {
  it('reads the id from a lesson URL with a query string', () => {
    expect(lessonIdFromUrl(LESSON_URL)).toBe(LESSON_ID);
  });

  it('returns null off a lesson page', () => {
    expect(lessonIdFromUrl('https://web.dio.me/home')).toBeNull();
  });
});

describe('parseClock', () => {
  it.each([
    ['01:18', 78],
    ['20:10', 1210],
    ['1:02:03', 3723],
  ])('parses %s', (text, seconds) => {
    expect(parseClock(text)).toBe(seconds);
  });

  it.each(['', 'normal', '12', '1:2:3:4', 'a:bc', null])(
    'rejects %j',
    (text) => {
      expect(parseClock(text)).toBeNull();
    },
  );
});

describe('page readers', () => {
  beforeEach(() => {
    document.body.innerHTML = lessonPageHtml();
  });

  it('reads the lesson title from the lesson list', () => {
    expect(readLessonTitle(LESSON_ID)).toBe(LESSON_TITLE);
    expect(readLessonTitle('missing')).toBeNull();
  });

  it('reads the lesson duration listed next to its title', () => {
    expect(readLessonDuration(LESSON_ID)).toBe(1211);
    expect(readLessonDuration('missing')).toBeNull();
  });

  it('reads the course title next to the lesson title in the header', () => {
    expect(readCourseTitle(LESSON_TITLE)).toBe(COURSE_TITLE);
    expect(readCourseTitle('Unknown lesson')).toBeNull();
  });

  it('finds the player iframe and its video id, ignoring other iframes', () => {
    const iframe = findPlayerIframe();
    expect(iframe?.id).toBe('ytc69');
    expect(iframe && videoIdFromIframe(iframe)).toBe('fqKZZcLj2Ps');
  });

  it('reads the position and duration from the player controls', () => {
    expect(readClapprTime()).toEqual({ seconds: 78, duration: 1210 });
  });

  it('returns null without a player', () => {
    document.body.innerHTML = lessonPageHtml({ videoId: null });
    expect(findPlayerIframe()).toBeNull();
    expect(readClapprTime()).toBeNull();
  });
});
