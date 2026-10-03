import type { Lesson, LessonVideo } from '../content/lesson/lesson.handler';
import type { PopupState } from './types';

/** Percentage of the video watched, 0–100. */
export function videoProgress({ seconds, duration }: LessonVideo): number {
  if (duration <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((seconds / duration) * 100)));
}

/** Popup state for the lesson open in the active tab (null: not on a lesson). */
export function toPopupState(
  lesson: Lesson | null,
  settings: Pick<PopupState, 'showSubtitles' | 'theaterMode'>,
): PopupState {
  if (!lesson) {
    return {
      context: 'offsite',
      ...settings,
      course: null,
      youtube: null,
      ytStatus: 'idle',
    };
  }
  const { video } = lesson;
  return {
    context: 'lesson',
    ...settings,
    course: {
      lessonTitle: lesson.lessonTitle,
      courseTitle: lesson.courseTitle,
      progress: video ? videoProgress(video) : 0,
    },
    youtube: video
      ? { id: video.id, seconds: Math.floor(video.seconds) }
      : null,
    ytStatus: 'idle',
  };
}

/** The video on YouTube, starting where the user stopped. */
export function youtubeUrl(video: { id: string; seconds: number }): string {
  const url = new URL('https://www.youtube.com/watch');
  url.searchParams.set('v', video.id);
  url.searchParams.set('t', `${Math.floor(video.seconds)}s`);
  return url.href;
}

/** Formats seconds as `m:ss` (or `h:mm:ss`). */
export function formatTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
