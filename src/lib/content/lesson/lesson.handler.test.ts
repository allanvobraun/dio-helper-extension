// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COURSE_TITLE,
  LESSON_ID,
  LESSON_TITLE,
  LESSON_URL,
  lessonPageHtml,
} from '../dio/fixture.test-utils';
import type { PlayerSnapshot } from '../dio/youtube-player';
import { LessonHandler } from './lesson.handler';

function handlerWith(snapshot: Partial<PlayerSnapshot> | null) {
  const iframe = document.createElement('iframe');
  return new LessonHandler({
    current: () =>
      snapshot && {
        iframe,
        videoId: 'fqKZZcLj2Ps',
        title: null,
        seconds: 78,
        duration: 1210,
        ...snapshot,
      },
  });
}

describe('LessonHandler.getLesson', () => {
  beforeEach(() => {
    vi.stubGlobal('location', new URL(LESSON_URL));
    document.body.innerHTML = lessonPageHtml();
  });

  it('returns the lesson with its video', () => {
    expect(handlerWith({}).getLesson()).toEqual({
      lessonId: LESSON_ID,
      lessonTitle: LESSON_TITLE,
      courseTitle: COURSE_TITLE,
      video: { id: 'fqKZZcLj2Ps', seconds: 78, duration: 1210 },
    });
  });

  it('returns null off a lesson page', () => {
    vi.stubGlobal('location', new URL('https://web.dio.me/home'));
    expect(handlerWith({}).getLesson()).toBeNull();
  });

  it('returns null when the lesson isn’t in the page yet', () => {
    document.body.innerHTML = '';
    expect(handlerWith({}).getLesson()).toBeNull();
  });

  it('has no video without a player', () => {
    expect(handlerWith(null).getLesson()?.video).toBeNull();
  });

  it('treats the DIO intro as not ready', () => {
    const lesson = handlerWith({ videoId: 'VMnr_7Nw-UA' }).getLesson();
    expect(lesson?.video).toBeNull();
  });

  it('treats a clip much shorter than the listed lesson as an intro', () => {
    // A rotated promo that isn't in the known list, before its title arrives.
    const lesson = handlerWith({
      videoId: 'newPromo',
      duration: 38,
    }).getLesson();
    expect(lesson?.video).toBeNull();
  });

  it('accepts a video close to the listed lesson duration', () => {
    // Listed as 20:11, the video is 20:10.6.
    const lesson = handlerWith({ duration: 1210.6 }).getLesson();
    expect(lesson?.video?.id).toBe('fqKZZcLj2Ps');
  });

  it('without a listed duration, treats a short clip with another title as an intro', () => {
    document.querySelector(`#content-item-${LESSON_ID} span + span`)?.remove();
    const lesson = handlerWith({
      videoId: 'otherIntro',
      title: 'CONSCIÊNCIA PRO 1 2',
      duration: 27,
    }).getLesson();
    expect(lesson?.video).toBeNull();
  });

  it('keeps a long video even when its YouTube title differs', () => {
    const lesson = handlerWith({ title: 'Different title' }).getLesson();
    expect(lesson?.video?.id).toBe('fqKZZcLj2Ps');
  });
});
