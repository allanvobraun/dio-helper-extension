<script lang="ts">
  import type { YtStatus } from './types';

  interface Props {
    status: YtStatus;
    /** Formatted resume point, or null to hide it. */
    timestamp: string | null;
    disabled: boolean;
    onclick: () => void;
  }

  let { status, timestamp, disabled, onclick }: Props = $props();

  const loading = $derived(status === 'loading');
  const label = $derived(
    loading
      ? 'Abrindo no YouTube…'
      : status === 'error'
        ? 'Tentar novamente'
        : 'Abrir no YouTube',
  );
</script>

<button
  type="button"
  class="btn btn-primary w-full justify-center gap-2 px-3 py-2 text-sm font-medium"
  {disabled}
  aria-busy={loading}
  {onclick}
>
  {#if loading}
    <span
      class="inline-block size-3.5 flex-none animate-spin-fast rounded-full border-2 border-accent-700 border-t-accent"
      aria-hidden="true"
    ></span>
  {:else}
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      class="flex-none"
      aria-hidden="true"
    >
      <rect
        x=".75"
        y=".75"
        width="14.5"
        height="10.5"
        rx="3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <polygon points="6.5,3.5 10.5,6 6.5,8.5" fill="currentColor" />
    </svg>
  {/if}
  <span>{label}</span>
  {#if timestamp}
    <span class="text-xs text-accent-300 tabular-nums">· {timestamp}</span>
  {/if}
</button>
