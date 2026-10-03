<script lang="ts">
  interface Props {
    onGoToDio: () => void;
  }

  let { onGoToDio }: Props = $props();
</script>

<section
  class="flex flex-col gap-1.5 rounded-md border border-dashed border-neutral-700 p-3"
>
  <h2 class="text-sm leading-tight font-medium">Nenhuma aula aberta</h2>
  <p class="text-xs leading-normal text-neutral-400">
    Abra uma aula na DIO para usar o botão Abrir no YouTube.
  </p>
  <button
    type="button"
    class="btn btn-secondary mt-1 self-start text-sm"
    onclick={onGoToDio}
  >
    Ir para dio.me
  </button>
</section>
