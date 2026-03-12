/**
 * Module: app-provider.cache.ts
 * Purpose: local cache layer for account-context fast hydration
 * Responsibilities: serialize/deserialize account list + last active account id
 * Constraints: client-only storage access, bounded staleness with TTL
 */

import type { Account } from '@/shared-kernel'

const CACHE_VERSION = 1
const CACHE_TTL_MS = 1000 * 60 * 30
const CACHE_KEY_PREFIX = 'app:accounts:v1:'

type AccountsCacheEnvelope = {
  version: number
  userId: string
  cachedAt: number
  lastActiveAccountId: string | null
  accounts: Record<string, Account>
}

type HydratedAccountsCache = {
  accounts: Record<string, Account>
  lastActiveAccountId: string | null
}

const getCacheKey = (userId: string) => `${CACHE_KEY_PREFIX}${userId}`

const hasWindowStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export function readAccountsCache(userId: string): HydratedAccountsCache | null {
  if (!hasWindowStorage()) return null

  try {
    const raw = window.localStorage.getItem(getCacheKey(userId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as AccountsCacheEnvelope
    const isExpired = Date.now() - parsed.cachedAt > CACHE_TTL_MS
    const isValidEnvelope =
      parsed.version === CACHE_VERSION &&
      parsed.userId === userId &&
      typeof parsed.cachedAt === 'number' &&
      typeof parsed.accounts === 'object' &&
      parsed.accounts !== null

    if (!isValidEnvelope || isExpired) {
      window.localStorage.removeItem(getCacheKey(userId))
      return null
    }

    return {
      accounts: parsed.accounts,
      lastActiveAccountId: parsed.lastActiveAccountId ?? null,
    }
  } catch {
    window.localStorage.removeItem(getCacheKey(userId))
    return null
  }
}

export function writeAccountsCache(
  userId: string,
  accounts: Record<string, Account>,
  lastActiveAccountId: string | null,
): void {
  if (!hasWindowStorage()) return

  const envelope: AccountsCacheEnvelope = {
    version: CACHE_VERSION,
    userId,
    cachedAt: Date.now(),
    lastActiveAccountId,
    accounts,
  }

  try {
    window.localStorage.setItem(getCacheKey(userId), JSON.stringify(envelope))
  } catch {
    // Ignore storage write failures (quota/private mode) and keep runtime behavior intact.
  }
}
