import { YoutubePlayer } from '../lib/content/dio/youtube-player';
import { LessonHandler } from '../lib/content/lesson/lesson.handler';
import { PageHandler } from '../lib/content/page/page.handler';
import { SubtitlesController } from '../lib/content/subtitles/subtitles.controller';
import { registerHandlers } from '../lib/messaging/handlers';

export default defineContentScript({
  matches: ['*://web.dio.me/*'],
  main(ctx) {
    const player = new YoutubePlayer();
    const unregister = registerHandlers([
      new PageHandler(),
      new LessonHandler(player),
    ]);
    const subtitles = new SubtitlesController(player);

    ctx.onInvalidated(() => {
      unregister();
      subtitles.dispose();
      player.dispose();
    });
    console.log('Hello content.');
  },
});
