/**
 * Shared server-side utility helpers.
 *
 * Lightweight pure utilities for use across admin/ modules.
 * These have no Firebase dependency and can also be imported by other
 * server-side code.
 */

// ---------------------------------------------------------------------------
// Firestore document helpers
// ---------------------------------------------------------------------------

/**
 * Converts a Firestore `Timestamp` (or Date / number) to a plain Date.
 * Safe to use in serialisation boundaries (Server Action → Client).
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Collection key helpers
// ---------------------------------------------------------------------------

/**
 * Builds a namespaced cache key to avoid collisions across collections.
 *
 * @example
 * cacheKey("users", userId)           // "users:abc123"
 * cacheKey("orgs", orgId, "members")  // "orgs:xyz:members"
 */
export function cacheKey(...segments: string[]): string {
  return segments.join(":");
}

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

/**
 * Retries an async operation up to `maxAttempts` times with exponential
 * back-off.  Useful for transient Firestore / Storage errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 200,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)),
        );
      }
    }
  }
  throw lastError;
}
