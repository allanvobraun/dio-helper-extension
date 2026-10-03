<script lang="ts">
  import type { Course } from './types';

  interface Props {
    course: Course;
  }

  let { course }: Props = $props();
</script>

<section class="flex flex-col gap-1 rounded-md bg-surface px-3 py-2.5">
  <p class="text-xs tracking-widest text-accent uppercase">Curso atual</p>
  <h2 class="text-base leading-tight font-medium text-pretty">
    {course.title}
  </h2>
  <p class="text-xs text-neutral-400">{course.lesson}</p>
  <div
    class="mt-1.5 h-1 overflow-hidden rounded-xs bg-neutral-800"
    role="progressbar"
    aria-label="Progresso do curso"
    aria-valuenow={course.progress}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div class="h-full bg-accent" style:width="{course.progress}%"></div>
  </div>
  <p class="text-xs text-neutral-500">{course.progress}% concluído</p>
</section>
