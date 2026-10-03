export interface Course {
  lessonTitle: string;
  courseTitle: string | null;
  /** How much of the lesson video was watched, 0–100. */
  progress: number;
}

export interface YoutubeVideo {
  id: string;
  /** Where the user stopped in the lesson, in seconds. */
  seconds: number;
}

export type PopupContext = 'lesson' | 'offsite';
export type YtStatus = 'idle' | 'loading' | 'error';

export interface PopupState {
  context: PopupContext;
  showSubtitles: boolean;
  theaterMode: boolean;
  course: Course | null;
  youtube: YoutubeVideo | null;
  ytStatus: YtStatus;
}
