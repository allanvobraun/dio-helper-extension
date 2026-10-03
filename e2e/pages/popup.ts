import type { Page } from '@playwright/test';

export interface PopupQuery {
  /** One of the mocked design states (`?state=...`). */
  state?: string;
  /** Tab the popup talks to (`?tabId=...`). Without `state`, the popup runs live against it. */
  tabId?: number;
}

/**
 * Page object for the extension popup. Keeps selectors out of the specs.
 * Opens the mocked `default` design state unless a query is given.
 */
export async function openPopup(
  page: Page,
  extensionId: string,
  query: PopupQuery = { state: 'default' },
) {
  const params = new URLSearchParams();
  if (query.state) params.set('state', query.state);
  if (query.tabId !== undefined) params.set('tabId', String(query.tabId));
  const search = params.size ? `?${params}` : '';
  await page.goto(`chrome-extension://${extensionId}/popup.html${search}`);

  return {
    /** `aria-busy` while the popup is checking the active tab. */
    root: page.getByRole('main'),
    heading: page.getByRole('heading', { name: 'DIO Helper' }),
    courseTitle: page.getByText('Formação Node.js Fundamentals'),
    progress: page.getByRole('progressbar', { name: 'Progresso do curso' }),
    emptyCard: page.getByText('Nenhuma aula aberta'),
    goToDio: page.getByRole('button', { name: 'Ir para dio.me' }),
    subtitlesSwitch: page.getByRole('switch', { name: 'Ocultar legendas' }),
    subtitlesHidden: page.getByText('Legendas desativadas em todos os cursos.'),
    noVideoNotice: page.getByText(
      'Esta aula não tem uma versão publicada no YouTube.',
    ),
    errorNotice: page.getByText('Não encontramos o vídeo no YouTube.', {
      exact: false,
    }),
    youtubeButton: page.getByRole('button', {
      name: /Abrir no YouTube|Abrindo no YouTube|Tentar novamente/,
    }),
  };
}
