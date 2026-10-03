<script lang="ts">
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
  <span
    class={[
      'mt-px grid size-4 flex-none place-items-center rounded-full border text-xs leading-none font-bold',
      isError
        ? 'border-accent-400 text-accent-400'
        : 'border-neutral-400 text-neutral-400',
    ]}
    aria-hidden="true"
  >
    !
  </span>
  <p class="text-xs leading-normal text-neutral-200">
    {@render children()}
  </p>
</div>
