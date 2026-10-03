/** Set on `<html>` while theater mode is on. React never re-renders `<html>`. */
export const THEATER_ATTR = 'data-dio-helper-theater';
export const THEATER_STYLE_ID = 'dio-helper-theater';

// DIO's lesson page is a 2×2 grid, `#root > div`, with hashed class names:
//   [header: lesson title, feedback] [aside: plan, XP, hearts]
//   [player wrapper > [data-player]] [ul: lesson list li#content-item-*]
// From 768px wide it uses `grid-template-columns: 65fr 35fr`; below that it is
// a single column, which theater mode leaves alone. The selectors anchor on
// the structure and on `[data-player]`, so they match only lesson pages and
// keep applying across DIO's client-side navigation.
const GRID = '#root > div:has(> div [data-player])';
const ON = `html[${THEATER_ATTR}] ${GRID}`;

export const THEATER_CSS = `
${GRID} { transition: grid-template-columns 250ms ease; }
@media (prefers-reduced-motion: reduce) {
  ${GRID} { transition: none; }
}
@media (min-width: 768px) {
  /* Same number of tracks as DIO's 65fr 35fr, so the change animates. */
  ${ON} { grid-template-columns: 100fr 0fr !important; }
  ${ON} > :nth-child(2):not(:has([data-player])),
  ${ON} > ul:has(li[id^="content-item-"]) {
    min-width: 0;
    overflow: hidden;
    visibility: hidden;
    padding: 0 !important;
  }
}
`;
