import { expect, type Page } from '@playwright/test';

/**
 * Page object for the extension popup. Keeps selectors out of the specs.
 * `tabId` is the tab the popup talks to (`?tabId=...`), standing in for the
 * active tab. Resolves once the popup has finished reading that tab.
 */
export async function openPopup(
  page: Page,
  extensionId: string,
  tabId: number,
) {
  await page.goto(
    `chrome-extension://${extensionId}/popup.html?tabId=${tabId}`,
  );
  const root = page.getByRole('main');
  await expect(root).toHaveAttribute('aria-busy', 'false');

  return {
    root,
    heading: page.getByRole('heading', { name: 'DIO Helper' }),
    lessonTitle: page.getByRole('heading', { level: 2 }),
    courseTitle: page.getByText('Fundamentos da IA Moderna'),
    progress: page.getByRole('progressbar', { name: 'Progresso da aula' }),
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
