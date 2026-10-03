export const LESSON_ID = '93b09cec-f92f-4810-ad1e-ff916216f022';
export const LESSON_URL = `https://web.dio.me/track/itau-java/course/era-da-ia/learning/${LESSON_ID}?autoplay=1&back=%2Ftrack`;
export const LESSON_TITLE = 'Como a Inteligência Artificial Nasceu';
export const COURSE_TITLE =
  'Fundamentos da IA Moderna: Machine Learning, LLMs, IA Generativa e Agentes';

/** Mirrors the structure of a real DIO lesson page (hashed classes omitted). */
export function lessonPageHtml({
  videoId = 'fqKZZcLj2Ps',
  iframeId = 'ytc69',
  position = '01:18',
  duration = '20:10',
}: {
  videoId?: string | null;
  iframeId?: string;
  position?: string;
  duration?: string;
} = {}) {
  const player =
    videoId === null
      ? ''
      : `<div data-player>
          <div data-container><div>
            <iframe id="${iframeId}" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"></iframe>
          </div></div>
          <div data-media-control>
            <div data-position>${position}</div>
            <div data-duration>${duration}</div>
          </div>
        </div>`;
  // `#root > div` is DIO's 2×2 grid: header, plan/XP aside, player, lessons.
  return `
    <div id="root">
      <div>
        <div><div><div>
          <span>${LESSON_TITLE}</span>
          <span>${COURSE_TITLE}</span>
        </div></div></div>
        <div><span>BASIC</span><span>XP 40/119</span></div>
        <div>${player}</div>
        <ul><li><ul>
          <li id="content-item-${LESSON_ID}"><div><span>${LESSON_TITLE}</span><span>20:11</span></div></li>
          <li id="content-item-other"><div><span>Entendendo Deep Learning</span><span>15:48</span></div></li>
        </ul></li></ul>
      </div>
      <iframe id="AWIN_CDT" src="about:blank"></iframe>
    </div>`;
}
