/**
 * Module: trace.utils.ts
 * Purpose: Canonical trace-id resolution utilities.
 * Responsibilities: resolve preferred trace id from envelope/payload/fallback candidates.
 * Constraints: deterministic logic, respect module boundaries
 */

function getTraceIdFromPayload(payload: unknown): string | undefined {
  if (payload == null || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const traceId = record.traceId;
  return typeof traceId === 'string' ? traceId : undefined;
}

export function resolvePreferredTraceId(
  envelopeTraceId: string | undefined,
  payload: unknown,
  fallbackTraceId?: string,
): string | undefined {
  if (typeof envelopeTraceId === 'string') return envelopeTraceId;
  const payloadTraceId = getTraceIdFromPayload(payload);
  if (payloadTraceId !== undefined) return payloadTraceId;
  return fallbackTraceId;
}
