import {
  lessonIdFromUrl,
  readCourseTitle,
  readLessonDuration,
  readLessonTitle,
} from '../dio/dom';
import type { YoutubePlayer } from '../dio/youtube-player';

/**
 * Known DIO intro clips. DIO rotates them (promos like "AI Job Hunter"), so
 * this list is only a shortcut: see `#isIntro` for the general rules.
 */
export const INTRO_VIDEO_IDS: ReadonlySet<string> = new Set([
  'VMnr_7Nw-UA',
  '0bvpl-q9L2g',
]);

/** Without a listed duration, a short clip with another title is an intro. */
const INTRO_MAX_SECONDS = 60;

/** A video shorter than this share of the listed lesson duration is an intro. */
const MIN_LESSON_SHARE = 0.5;

export interface LessonVideo {
  id: string;
  seconds: number;
  duration: number;
}

export interface Lesson {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string | null;
  /** The lesson's YouTube video, or null when there's none (yet). */
  video: LessonVideo | null;
}

/** The DIO lesson open in the tab. */
export class LessonHandler {
  readonly #player: Pick<YoutubePlayer, 'current'>;

  constructor(player: Pick<YoutubePlayer, 'current'>) {
    this.#player = player;
  }

  /** The current lesson, or null when the tab isn't on a lesson page. */
  getLesson(): Lesson | null {
    const lessonId = lessonIdFromUrl(location.href);
    if (!lessonId) return null;
    const lessonTitle = readLessonTitle(lessonId);
    if (!lessonTitle) return null;

    return {
      lessonId,
      lessonTitle,
      courseTitle: readCourseTitle(lessonTitle),
      video: this.#video(lessonTitle, readLessonDuration(lessonId)),
    };
  }

  #video(
    lessonTitle: string,
    listedDuration: number | null,
  ): LessonVideo | null {
    const snapshot = this.#player.current();
    if (!snapshot) return null;
    const { videoId, title, seconds, duration } = snapshot;
    if (
      this.#isIntro({ videoId, title, duration }, lessonTitle, listedDuration)
    )
      return null;
    return { id: videoId, seconds, duration };
  }

  /**
   * DIO plays a short promo before the lesson video, in its own player. It is
   * much shorter than the duration the lesson list shows for the lesson.
   */
  #isIntro(
    video: { videoId: string; title: string | null; duration: number },
    lessonTitle: string,
    listedDuration: number | null,
  ): boolean {
    if (INTRO_VIDEO_IDS.has(video.videoId)) return true;
    if (video.duration <= 0) return false;
    if (listedDuration !== null) {
      return video.duration < listedDuration * MIN_LESSON_SHARE;
    }
    return (
      video.title !== null &&
      video.title !== lessonTitle &&
      video.duration < INTRO_MAX_SECONDS
    );
  }
}
