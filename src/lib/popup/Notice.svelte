<script lang="ts">
  import {
    ExclamationCircleOutline,
    InfoCircleOutline,
  } from 'flowbite-svelte-icons';
  import type { Snippet } from 'svelte';

  interface Props {
    variant: 'neutral' | 'error';
    children: Snippet;
  }

  let { variant, children }: Props = $props();

  const isError = $derived(variant === 'error');
</script>

<div
  class={[
    'flex gap-2 rounded-md px-2.5 py-2',
    isError ? 'bg-accent-900' : 'bg-neutral-900',
  ]}
  role={isError ? 'alert' : 'status'}
>
  {#if isError}
    <ExclamationCircleOutline class="mt-px size-4 flex-none text-accent-400" />
  {:else}
    <InfoCircleOutline class="mt-px size-4 flex-none text-neutral-400" />
  {/if}
  <p class="text-xs leading-normal text-neutral-200">
    {@render children()}
  </p>
</div>
