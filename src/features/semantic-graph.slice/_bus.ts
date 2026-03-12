/**
 * semantic-graph.slice — _bus.ts
 *
 * In-process event bus for tag lifecycle events.
 * Consumers subscribe with onTagEvent(); producers call publishTagEvent().
 *
 * [T1] New slices MUST subscribe via onTagEvent() — do NOT maintain own tag data.
 */

import type { ImplementsEventEnvelopeContract, TagLifecycleEventPayloadMap, TagLifecycleEventKey } from '@/shared-kernel';

type TagEventHandler<K extends TagLifecycleEventKey> = (
  payload: TagLifecycleEventPayloadMap[K]
) => void | Promise<void>;

type TagEventHandlerMap = {
  [K in TagLifecycleEventKey]?: Array<TagEventHandler<K>>;
};

export const implementsEventEnvelope: ImplementsEventEnvelopeContract['implementsEventEnvelope'] = true;

const handlers: TagEventHandlerMap = {};

export function onTagEvent<K extends TagLifecycleEventKey>(
  eventKey: K,
  handler: TagEventHandler<K>
): () => void {
  if (!handlers[eventKey]) {
    (handlers as Record<string, unknown[]>)[eventKey] = [];
  }
  (handlers[eventKey] as Array<TagEventHandler<K>>).push(handler);

  return () => {
    const list = handlers[eventKey] as Array<TagEventHandler<K>> | undefined;
    if (list) {
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    }
  };
}

export function publishTagEvent<K extends TagLifecycleEventKey>(
  eventKey: K,
  payload: TagLifecycleEventPayloadMap[K]
): void {
  const list = handlers[eventKey] as Array<TagEventHandler<K>> | undefined;
  if (!list?.length) return;
  for (const handler of list) {
    try {
      const result = handler(payload);
      if (result && typeof result.catch === 'function') {
        // Internal debug log — not user-facing; no i18n required.
        result.catch((err: unknown) =>
          console.error('[semantic-graph/_bus] async handler error for', eventKey, err)
        );
      }
    } catch (err) {
      // Internal debug log — not user-facing; no i18n required.
      console.error('[semantic-graph/_bus] sync handler error for', eventKey, err);
    }
  }
}
