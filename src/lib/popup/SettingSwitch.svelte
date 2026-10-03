<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
    icon: Snippet;
    statusText?: string;
  }

  let { label, description, checked, onToggle, icon, statusText }: Props =
    $props();
</script>

<div class="flex items-center gap-2.5">
  {@render icon()}
  <div class="min-w-0 flex-1">
    <p class="text-sm leading-tight">{label}</p>
    <p class="text-xs text-neutral-500">{description}</p>
  </div>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    class={[
      'relative h-5 w-9 flex-none cursor-pointer rounded-full border p-0 transition-[background-color] duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      checked
        ? 'border-accent bg-accent-700'
        : 'border-neutral-700 bg-neutral-800',
    ]}
    onclick={onToggle}
  >
    <span
      class={[
        'absolute top-0.5 left-0.5 size-3.5 rounded-full transition-transform duration-150 ease-[ease]',
        checked ? 'translate-x-4 bg-accent-200' : 'bg-neutral-400',
      ]}
    ></span>
  </button>
</div>
{#if checked && statusText}
  <p class="-mt-1.5 text-xs text-accent-300" role="status">
    {statusText}
  </p>
{/if}
