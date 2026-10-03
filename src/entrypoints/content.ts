import { PageHandler } from '../lib/content/page/page.handler';
import { registerHandlers } from '../lib/messaging/handlers';

export default defineContentScript({
  matches: ['*://web.dio.me/*'],
  main(ctx) {
    const unregister = registerHandlers([new PageHandler()]);
    ctx.onInvalidated(unregister);
    console.log('Hello content.');
  },
});
