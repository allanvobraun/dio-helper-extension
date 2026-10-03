import type { Page } from '@playwright/test';

/**
 * Page object for the extension popup. Keeps selectors out of the specs.
 * `state` picks one of the mocked design states (`?state=...`).
 */
export async function openPopup(page: Page, extensionId: string, state = '') {
  const query = state ? `?state=${state}` : '';
  await page.goto(`chrome-extension://${extensionId}/popup.html${query}`);

  return {
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
