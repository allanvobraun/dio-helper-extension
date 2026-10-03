<script lang="ts">
  import { CaptionOutline, DesktopPcOutline } from 'flowbite-svelte-icons';
  import {
    activeTab,
    ContentMessageError,
  } from '../../lib/messaging/active-tab';
  import CourseCard from '../../lib/popup/CourseCard.svelte';
  import EmptyCard from '../../lib/popup/EmptyCard.svelte';
  import Header from '../../lib/popup/Header.svelte';
  import Notice from '../../lib/popup/Notice.svelte';
  import SettingSwitch from '../../lib/popup/SettingSwitch.svelte';
  import {
    formatTimestamp,
    toPopupState,
    youtubeUrl,
  } from '../../lib/popup/state';
  import YoutubeButton from '../../lib/popup/YoutubeButton.svelte';
  import { showSubtitles, theaterMode } from '../../lib/settings';

  // The lesson comes from the content script in the active tab, and the
  // settings from storage.sync.
  let popup = $state(
    toPopupState(null, { showSubtitles: false, theaterMode: false }),
  );
  let detecting = $state(true);

  async function loadPopupState() {
    try {
      const [lesson, shown, theater] = await Promise.all([
        activeTab.getLesson(),
        showSubtitles.getValue(),
        theaterMode.getValue(),
      ]);
      popup = toPopupState(lesson, {
        showSubtitles: shown,
        theaterMode: theater,
      });
    } catch (error) {
      console.debug(
        '[popup] could not read the lesson in the active tab:',
        error instanceof ContentMessageError ? error.code : error,
      );
      const [shown, theater] = await Promise.all([
        showSubtitles.getValue().catch(() => false),
        theaterMode.getValue().catch(() => false),
      ]);
      popup = toPopupState(null, {
        showSubtitles: shown,
        theaterMode: theater,
      });
    } finally {
      detecting = false;
    }
  }

  loadPopupState();

  const version = browser.runtime.getManifest().version;

  const onLesson = $derived(popup.context === 'lesson');
  const noYoutube = $derived(onLesson && popup.youtube === null);
  const timestamp = $derived(
    popup.youtube && popup.ytStatus !== 'error'
      ? formatTimestamp(popup.youtube.seconds)
      : null,
  );
  const ytDisabled = $derived(
    !onLesson || popup.youtube === null || popup.ytStatus === 'loading',
  );

  function toggleSubtitles() {
    popup.showSubtitles = !popup.showSubtitles;
    void showSubtitles.setValue(popup.showSubtitles);
  }

  function toggleTheater() {
    popup.theaterMode = !popup.theaterMode;
    void theaterMode.setValue(popup.theaterMode);
  }

  async function openOnYoutube() {
    popup.ytStatus = 'loading';
    try {
      const lesson = await activeTab.getLesson();
      const video = lesson?.video;
      if (!video) {
        popup.ytStatus = 'error';
        return;
      }
      await browser.tabs.create({ url: youtubeUrl(video) });
      window.close();
    } catch {
      popup.ytStatus = 'error';
    }
  }

  function goToDio() {
    browser.tabs.create({ url: 'https://web.dio.me' });
  }
</script>

<main
  class="flex w-80 flex-col gap-3.5 bg-bg p-3.5 font-sans text-text"
  aria-busy={detecting}
>
  <Header {version} />

  {#if onLesson && popup.course}
    <CourseCard course={popup.course} />
  {:else}
    <EmptyCard onGoToDio={goToDio} />
  {/if}

  <SettingSwitch
    label="Legendas"
    description="Desativadas por padrão em todas as aulas"
    checked={popup.showSubtitles}
    onToggle={toggleSubtitles}
    statusText="Legendas ativadas em todos os cursos."
  >
    {#snippet icon()}
      <CaptionOutline
        class="size-5.5 flex-none text-neutral-300"
        strokeWidth={1.5}
      />
    {/snippet}
  </SettingSwitch>

  <SettingSwitch
    label="Modo teatro"
    description="Vídeo em largura total nas aulas"
    checked={popup.theaterMode}
    onToggle={toggleTheater}
    statusText="Modo teatro ativado. Pressione T na aula para alternar."
  >
    {#snippet icon()}
      <DesktopPcOutline
        class="size-5.5 flex-none text-neutral-300"
        strokeWidth={1.5}
      />
    {/snippet}
  </SettingSwitch>

  {#if popup.ytStatus === 'error'}
    <Notice variant="error">
      Não encontramos o vídeo no YouTube. Verifique sua conexão e tente de novo.
    </Notice>
  {:else if noYoutube}
    <Notice variant="neutral">
      Esta aula não tem uma versão publicada no YouTube.
    </Notice>
  {/if}

  <YoutubeButton
    status={popup.ytStatus}
    {timestamp}
    disabled={ytDisabled}
    onclick={openOnYoutube}
  />
</main>
