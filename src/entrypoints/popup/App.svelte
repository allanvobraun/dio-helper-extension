<script lang="ts">
  import CourseCard from '../../lib/popup/CourseCard.svelte';
  import EmptyCard from '../../lib/popup/EmptyCard.svelte';
  import Header from '../../lib/popup/Header.svelte';
  import {
    formatTimestamp,
    mockPopupState,
    scenarioFromUrl,
  } from '../../lib/popup/mock';
  import Notice from '../../lib/popup/Notice.svelte';
  import SubtitlesToggle from '../../lib/popup/SubtitlesToggle.svelte';
  import YoutubeButton from '../../lib/popup/YoutubeButton.svelte';

  const MOCK_OPEN_DELAY_MS = 1400;

  // Open popup.html?state=offsite (or off, noyt, loading, error) to preview
  // each design state. TODO: load the real state instead of mock data.
  let popup = $state(mockPopupState(scenarioFromUrl()));

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
    // TODO: persist to storage.sync `hideSubtitles`; the content script
    // applies it to the player, and the action badge is updated.
  }

  function openOnYoutube() {
    popup.ytStatus = 'loading';
    // TODO: ask the content script for the video id + currentTime, then
    // browser.tabs.create({ url: `https://www.youtube.com/watch?v=${id}&t=${s}s` })
    // and close the popup. After a ~5s timeout, set ytStatus to 'error'.
    setTimeout(() => {
      popup.ytStatus = 'idle';
    }, MOCK_OPEN_DELAY_MS);
  }

  function goToDio() {
    browser.tabs.create({ url: 'https://web.dio.me' });
  }
</script>

<main class="flex w-80 flex-col gap-3.5 bg-bg p-3.5 font-sans text-text">
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
