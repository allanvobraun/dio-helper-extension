export interface Course {
  title: string;
  lesson: string;
  /** Course progress, 0–100. */
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
  hideSubtitles: boolean;
  course: Course | null;
  youtube: YoutubeVideo | null;
  ytStatus: YtStatus;
}

/** The six states from the design handoff. */
export type MockScenario =
  | 'default'
  | 'off'
  | 'offsite'
  | 'noyt'
  | 'loading'
  | 'error';
