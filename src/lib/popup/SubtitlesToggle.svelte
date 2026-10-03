<script lang="ts">
  interface Props {
    checked: boolean;
    onToggle: () => void;
  }

  let { checked, onToggle }: Props = $props();
</script>

<div class="flex items-center gap-2.5">
  <span
    class="grid h-5.5 w-7.5 flex-none place-items-center rounded-sm border border-neutral-500 text-xs leading-none font-semibold text-neutral-300"
    aria-hidden="true"
  >
    CC
  </span>
  <div class="min-w-0 flex-1">
    <p class="text-sm leading-tight">Ocultar legendas</p>
    <p class="text-xs text-neutral-500">Em todas as aulas da DIO</p>
  </div>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label="Ocultar legendas"
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
{#if checked}
  <p class="-mt-1.5 text-xs text-accent-300" role="status">
    Legendas desativadas em todos os cursos.
  </p>
{/if}
