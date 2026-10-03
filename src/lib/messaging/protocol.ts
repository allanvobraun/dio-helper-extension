import { defineExtensionMessaging } from '@webext-core/messaging';
import type { LessonHandler } from '../content/lesson/lesson.handler';
import type { PageHandler } from '../content/page/page.handler';

/**
 * Builds a messaging protocol from a handler class: each public method is an
 * action, its first parameter is the data and its (awaited) return value the
 * response. A second parameter receives the `ExtensionMessage` (sender info)
 * and isn't part of the protocol.
 */
export type ProtocolOf<C> = {
  [K in keyof C as C[K] extends (...args: never[]) => unknown
    ? K
    : never]: C[K] extends (...args: infer A) => infer R
    ? (...args: A extends [] ? [] : [data: A[0]]) => Awaited<R>
    : never;
};

/**
 * Every action the popup can call in the active tab's content script,
 * inferred from the handler classes in `src/lib/content/<feature>/`.
 * Import them with `import type` so no content-script code reaches the popup.
 */
export type ContentProtocol = ProtocolOf<PageHandler & LessonHandler>;

export const contentMessenger = defineExtensionMessaging<ContentProtocol>();
