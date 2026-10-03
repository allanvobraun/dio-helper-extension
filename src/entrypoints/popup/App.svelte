<script lang="ts">
  import {
    activeTab,
    ContentMessageError,
  } from '../../lib/messaging/active-tab';
  import CourseCard from '../../lib/popup/CourseCard.svelte';
  import EmptyCard from '../../lib/popup/EmptyCard.svelte';
  import Header from '../../lib/popup/Header.svelte';
  import Notice from '../../lib/popup/Notice.svelte';
  import SubtitlesToggle from '../../lib/popup/SubtitlesToggle.svelte';
  import {
    formatTimestamp,
    toPopupState,
    youtubeUrl,
  } from '../../lib/popup/state';
  import YoutubeButton from '../../lib/popup/YoutubeButton.svelte';
  import { hideSubtitles } from '../../lib/settings';

  // The lesson comes from the content script in the active tab, and the
  // subtitles preference from storage.sync.
  let popup = $state(toPopupState(null, false));
  let detecting = $state(true);

  async function loadPopupState() {
    try {
      const [lesson, hidden] = await Promise.all([
        activeTab.getLesson(),
        hideSubtitles.getValue(),
      ]);
      popup = toPopupState(lesson, hidden);
    } catch (error) {
      console.debug(
        '[popup] could not read the lesson in the active tab:',
        error instanceof ContentMessageError ? error.code : error,
      );
      const hidden = await hideSubtitles.getValue().catch(() => false);
      popup = toPopupState(null, hidden);
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
    popup.hideSubtitles = !popup.hideSubtitles;
    void hideSubtitles.setValue(popup.hideSubtitles);
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

  <SubtitlesToggle checked={popup.hideSubtitles} onToggle={toggleSubtitles} />

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
