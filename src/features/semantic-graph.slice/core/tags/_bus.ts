/**
 * semantic-graph.slice/core/tags/_bus.ts
 *
 * DDD-layer tag lifecycle event bus.
 *
 * [T1] New slices MUST subscribe via onTagEvent(); do NOT maintain own tag data.
 * [D8] publishTagEvent is synchronous — no async side effects in the bus dispatch.
 *
 * Per docs/architecture/README.md:
 *   Tag event bus operations belong to the semantic-graph.slice/core/tags/ layer.
 *   publishTagEvent must remain synchronous so callers can reason about ordering.
 */

import type {
  ImplementsEventEnvelopeContract,
  TagLifecycleEventPayloadMap,
  TagLifecycleEventKey,
} from '@/shared-kernel';

type TagEventHandler<K extends TagLifecycleEventKey> = (
  payload: TagLifecycleEventPayloadMap[K]
) => void | Promise<void>;

type TagEventHandlerMap = {
  [K in TagLifecycleEventKey]?: Array<TagEventHandler<K>>;
};

/**
 * Marker constant that affirms this module satisfies the EventEnvelope contract.
 * Required by ImplementsEventEnvelopeContract for bus implementations.
 */
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
        result.catch((err: unknown) =>
          console.error('[semantic-graph/core/tags/_bus] async handler error for', eventKey, err)
        );
      }
    } catch (err) {
      console.error('[semantic-graph/core/tags/_bus] sync handler error for', eventKey, err);
    }
  }
}

