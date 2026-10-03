<script lang="ts">
  interface Props {
    version: string;
  }

  let { version }: Props = $props();
</script>

<header class="flex items-center gap-2">
  <!-- TODO: replace with the real logo icon. -->
  <span
    class="grid size-5.5 place-items-center rounded-md bg-accent-800 text-xs leading-none font-semibold tracking-tight text-accent-100"
    aria-hidden="true"
  >
    dh
  </span>
  <h1 class="mr-auto text-sm leading-tight font-medium">DIO Helper</h1>
  <span class="text-xs text-neutral-500">v{version}</span>
</header>
