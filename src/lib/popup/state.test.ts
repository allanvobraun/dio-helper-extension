import { describe, expect, it } from 'vitest';
import type { Lesson } from '../content/lesson/lesson.handler';
import {
  formatTimestamp,
  toPopupState,
  videoProgress,
  youtubeUrl,
} from './state';

const LESSON: Lesson = {
  lessonId: 'abc',
  lessonTitle: 'Como a Inteligência Artificial Nasceu',
  courseTitle: 'Fundamentos da IA Moderna',
  video: { id: 'fqKZZcLj2Ps', seconds: 78.6, duration: 1210 },
};

describe('toPopupState', () => {
  it('maps a lesson to the lesson card and its video', () => {
    expect(toPopupState(LESSON, true)).toEqual({
      context: 'lesson',
      hideSubtitles: true,
      course: {
        lessonTitle: LESSON.lessonTitle,
        courseTitle: LESSON.courseTitle,
        progress: 6,
      },
      youtube: { id: 'fqKZZcLj2Ps', seconds: 78 },
      ytStatus: 'idle',
    });
  });

  it('shows the offsite state without a lesson', () => {
    expect(toPopupState(null, false)).toMatchObject({
      context: 'offsite',
      course: null,
      youtube: null,
    });
  });

  it('has no YouTube video and no progress while the video isn’t ready', () => {
    const state = toPopupState({ ...LESSON, video: null }, false);
    expect(state.youtube).toBeNull();
    expect(state.course?.progress).toBe(0);
  });
});

describe('videoProgress', () => {
  it.each([
    [{ seconds: 605, duration: 1210 }, 50],
    [{ seconds: 0, duration: 0 }, 0],
    [{ seconds: 1300, duration: 1210 }, 100],
    [{ seconds: -5, duration: 1210 }, 0],
  ])('%j → %i%%', (time, expected) => {
    expect(videoProgress({ id: 'x', ...time })).toBe(expected);
  });
});

describe('youtubeUrl', () => {
  it('starts the video at the whole second the user stopped at', () => {
    expect(youtubeUrl({ id: 'fqKZZcLj2Ps', seconds: 78.9 })).toBe(
      'https://www.youtube.com/watch?v=fqKZZcLj2Ps&t=78s',
    );
  });
});

describe('formatTimestamp', () => {
  it.each([
    [0, '0:00'],
    [78, '1:18'],
    [768.9, '12:48'],
    [3723, '1:02:03'],
  ])('%d s → %s', (seconds, text) => {
    expect(formatTimestamp(seconds)).toBe(text);
  });
});
