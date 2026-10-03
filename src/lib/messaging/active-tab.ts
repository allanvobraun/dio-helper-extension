import type { GetDataType, GetReturnType } from '@webext-core/messaging';
import { type ContentProtocol, contentMessenger } from './protocol';

type Action = keyof ContentProtocol;

/** Data arguments for `action`: none when the action takes no data. */
export type DataArgs<K extends Action> =
  GetDataType<ContentProtocol[K]> extends undefined
    ? [data?: undefined]
    : [data: GetDataType<ContentProtocol[K]>];

export type ActionResult<K extends Action> = GetReturnType<ContentProtocol[K]>;

/**
 * - `no-tab`: there is no active tab.
 * - `no-receiver`: no content script listens in the tab (not a DIO page, or
 *   the tab was opened before the extension loaded).
 * - `timeout`: the content script didn't answer in time.
 * - `failed`: the handler threw, or something else went wrong.
 */
export type ContentMessageErrorCode =
  | 'no-tab'
  | 'no-receiver'
  | 'timeout'
  | 'failed';

export class ContentMessageError extends Error {
  constructor(
    readonly code: ContentMessageErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ContentMessageError';
  }
}

export const DEFAULT_TIMEOUT_MS = 5000;

// @webext-core/messaging rejects with "No response" when nothing answers in
// the tab; the browser's own wording is kept in case it surfaces directly.
const NO_RECEIVER =
  /^No response$|Receiving end does not exist|Could not establish connection/i;

/**
 * The tab the popup talks to: `?tabId=<n>` when given (used by e2e tests),
 * otherwise the active tab of the current window.
 */
async function resolveTargetTabId(): Promise<number> {
  const param = new URLSearchParams(location.search).get('tabId');
  if (param !== null && Number.isInteger(Number(param))) return Number(param);

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) {
    throw new ContentMessageError('no-tab', 'No active tab found');
  }
  return tab.id;
}

function toContentMessageError(error: unknown): ContentMessageError {
  if (error instanceof ContentMessageError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const code = NO_RECEIVER.test(message) ? 'no-receiver' : 'failed';
  return new ContentMessageError(code, message, { cause: error });
}

// The library's overloads can't resolve against a generic action type, so the
// call goes through this signature. `sendToActiveTab` keeps the public types.
const send = contentMessenger.sendMessage as (
  type: Action,
  data: unknown,
  tabId: number,
) => Promise<unknown>;

/**
 * Calls `action` in the active tab's content script.
 * Rejects with a `ContentMessageError`.
 */
export async function sendToActiveTab<K extends Action>(
  action: K,
  ...args: DataArgs<K>
): Promise<ActionResult<K>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const tabId = await resolveTargetTabId();
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(new ContentMessageError('timeout', `"${action}" timed out`)),
        DEFAULT_TIMEOUT_MS,
      );
    });
    const result = await Promise.race([send(action, args[0], tabId), timeout]);
    return result as ActionResult<K>;
  } catch (error) {
    throw toContentMessageError(error);
  } finally {
    clearTimeout(timer);
  }
}

export type ActiveTabClient = {
  [K in Action]: (...args: DataArgs<K>) => Promise<ActionResult<K>>;
};

/**
 * Typed client for the active tab's content script:
 * `const info = await activeTab.getPageInfo();`
 */
export const activeTab = new Proxy({} as ActiveTabClient, {
  get:
    (_target, action) =>
    (...args: DataArgs<Action>) =>
      sendToActiveTab(action as Action, ...args),
});
