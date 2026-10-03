<script lang="ts">
  import type { Course } from './types';

  interface Props {
    course: Course;
  }

  let { course }: Props = $props();
</script>

<section class="flex flex-col gap-1 rounded-md bg-surface px-3 py-2.5">
  <p class="text-xs tracking-widest text-accent uppercase">Aula atual</p>
  <h2 class="text-base leading-tight font-medium text-pretty">
    {course.lessonTitle}
  </h2>
  {#if course.courseTitle !== null}
    <p class="text-xs text-neutral-400">{course.courseTitle}</p>
  {/if}
  <div
    class="mt-1.5 h-1 overflow-hidden rounded-xs bg-neutral-800"
    role="progressbar"
    aria-label="Progresso da aula"
    aria-valuenow={course.progress}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div class="h-full bg-accent" style:width="{course.progress}%"></div>
  </div>
  <p class="text-xs text-neutral-500">{course.progress}% assistido</p>
</section>
