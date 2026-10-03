import type { Course, MockScenario, PopupState, YoutubeVideo } from './types';

// TODO: replace this whole module with real data. Course info and the YouTube
// video come from a content-script message to the active DIO tab, the context
// from the active tab URL, and `hideSubtitles` from `storage` (sync area).

const MOCK_COURSE: Course = {
  title: 'Formação Node.js Fundamentals',
  lesson: 'Aula 4 · Criando sua primeira API REST',
  progress: 38,
};

const MOCK_VIDEO: YoutubeVideo = { id: 'dQw4w9WgXcQ', seconds: 768 };

const SCENARIOS: readonly MockScenario[] = [
  'default',
  'off',
  'offsite',
  'noyt',
  'loading',
  'error',
];

/** Reads `?state=<scenario>` from the popup URL so every design state can be previewed. */
export function scenarioFromUrl(search = location.search): MockScenario {
  const value = new URLSearchParams(search).get('state');
  return SCENARIOS.find((s) => s === value) ?? 'default';
}

export function mockPopupState(scenario: MockScenario): PopupState {
  const onLesson = scenario !== 'offsite';
  return {
    context: onLesson ? 'lesson' : 'offsite',
    hideSubtitles: scenario === 'off',
    course: onLesson ? MOCK_COURSE : null,
    youtube: onLesson && scenario !== 'noyt' ? MOCK_VIDEO : null,
    ytStatus:
      scenario === 'loading'
        ? 'loading'
        : scenario === 'error'
          ? 'error'
          : 'idle',
  };
}

/** Formats seconds as `m:ss` (or `h:mm:ss`). */
export function formatTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
