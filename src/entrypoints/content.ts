import { YoutubePlayer } from '../lib/content/dio/youtube-player';
import { LessonHandler } from '../lib/content/lesson/lesson.handler';
import { PageHandler } from '../lib/content/page/page.handler';
import { SubtitlesController } from '../lib/content/subtitles/subtitles.controller';
import { TheaterController } from '../lib/content/theater/theater.controller';
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
    const theater = new TheaterController();

    ctx.onInvalidated(() => {
      unregister();
      subtitles.dispose();
      theater.dispose();
      player.dispose();
    });
    console.log('Hello content.');
  },
});
