/**
 * Server-side cache layer.
 *
 * Provides a lightweight in-process memory cache to reduce the number of
 * direct Firestore read operations and lower costs.
 *
 * Architecture:
 *   - Reads: check cache first → fallback to Firestore if miss.
 *   - Writes: write to cache immediately; optionally schedule a deferred
 *     Firestore write via `invalidate()` + re-fetch pattern or direct
 *     `commitBatch()`.
 *
 * Upgrade path:
 *   - Replace the in-process `Map` with Redis (`ioredis`) for multi-instance
 *     deployments where the Next.js server scales horizontally.
 *   - Swap `MemoryCacheStore` for `RedisCacheStore` without changing callers.
 *   - For Redis-backed caching, wire the `ICachePort` from `@/shared/ports`
 *     to `src/infrastructure/upstash/redis.ts`.
 *
 * Only use this module in Server Actions or Route Handlers.
 */

export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/** Default TTL: 5 minutes. */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * In-process memory cache.
 * Suitable for single-instance deployments and development.
 * Replace with RedisCacheStore for horizontal scaling.
 */
export class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/** Singleton cache store. Swap for a Redis-backed store in production. */
export const cacheStore: CacheStore = new MemoryCacheStore();

/**
 * Cache-aside read helper.
 *
 * Returns the cached value if present and not expired; otherwise calls
 * `fetchFn`, caches the result, and returns it.
 *
 * @param key     - Cache key (use a consistent naming convention, e.g. `users:{uid}`)
 * @param fetchFn - Async function that fetches the value on a cache miss
 * @param ttlMs   - TTL in milliseconds (default: 5 min)
 */
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const cached = await cacheStore.get<T>(key);
  if (cached !== undefined) return cached;

  const value = await fetchFn();
  await cacheStore.set(key, value, ttlMs);
  return value;
}

/**
 * Invalidates a cache entry by key.
 * Call this after a successful write to force the next read to re-fetch.
 */
export async function invalidateCache(key: string): Promise<void> {
  await cacheStore.delete(key);
}
