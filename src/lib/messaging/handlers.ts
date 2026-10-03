import type {
  GetReturnType,
  MaybePromise,
  RemoveListenerCallback,
} from '@webext-core/messaging';
import { type ContentProtocol, contentMessenger } from './protocol';

type UnionToIntersection<U> = (
  U extends unknown
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never;

type MissingHandlers<T extends readonly object[]> = Exclude<
  keyof ContentProtocol,
  keyof UnionToIntersection<T[number]>
>;

/** Resolves to an error type naming the actions no handler class implements. */
type CoversProtocol<T extends readonly object[]> = [
  MissingHandlers<T>,
] extends [never]
  ? unknown
  : { __missingHandlers: MissingHandlers<T> };

type AnyHandler = (
  data: unknown,
  message: unknown,
) => MaybePromise<GetReturnType<ContentProtocol[keyof ContentProtocol]>>;

/** Public method names of `instance`, including inherited ones. */
function handlerNames(instance: object): string[] {
  const names = new Set<string>();
  let proto: object | null = Object.getPrototypeOf(instance);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (name !== 'constructor' && typeof descriptor?.value === 'function') {
        names.add(name);
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return [...names];
}

/**
 * Registers handler classes as content-script message listeners.
 *
 * Every public method of each instance becomes the handler for the action of
 * the same name (matching how `ProtocolOf` builds `ContentProtocol`), so keep
 * helpers `#private`. The compiler rejects the call when a class in
 * `ContentProtocol` isn't registered, and registering the same action twice
 * throws.
 *
 * @returns A callback that removes every listener registered here.
 */
export function registerHandlers<const T extends readonly object[]>(
  handlers: T & CoversProtocol<T>,
): RemoveListenerCallback {
  const removers: RemoveListenerCallback[] = [];
  const owners = new Map<string, string>();

  for (const instance of handlers) {
    const owner = instance.constructor.name;
    for (const name of handlerNames(instance)) {
      const existing = owners.get(name);
      if (existing) {
        throw new Error(
          `Message "${name}" is handled by both ${existing} and ${owner}`,
        );
      }
      owners.set(name, owner);

      const method = (instance as Record<string, AnyHandler>)[name];
      if (!method) continue;
      removers.push(
        contentMessenger.onMessage(name as keyof ContentProtocol, (message) =>
          method.call(instance, message.data, message),
        ),
      );
    }
  }

  return () => {
    for (const remove of removers) remove();
  };
}
