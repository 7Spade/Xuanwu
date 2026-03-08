/**
 * Module: app-provider.queries.ts
 * Purpose: firestore subscription factories for app-provider
 * Responsibilities: provide app-level account subscriptions without UI coupling
 * Constraints: deterministic logic, respect module boundaries
 */

import { db } from '@/shared-infra/frontend-firebase'
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  type Unsubscribe,
  where,
} from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter'
import { snapshotToRecord } from '@/shared-infra/frontend-firebase/firestore/firestore.utils'
import type { Account } from '@/shared-kernel'

export function subscribeToAccountsForUser(
  userId: string,
  onUpdate: (accounts: Record<string, Account>) => void,
): Unsubscribe {
  const accountQuery = query(
    collection(db, 'accounts'),
    where('memberIds', 'array-contains', userId),
  )

  let hasEmitted = false
  const emit = (accounts: Record<string, Account>) => {
    hasEmitted = true
    onUpdate(accounts)
  }

  // Warm-up read to avoid a blank switcher while waiting for the realtime stream.
  void getDocs(accountQuery)
    .then((snap) => {
      if (!hasEmitted) emit(snapshotToRecord<Account>(snap))
    })
    .catch(() => {
      // Realtime listener below remains the source of truth; ignore warm-up failures.
    })

  return onSnapshot(accountQuery, (snap) => emit(snapshotToRecord<Account>(snap)))
}
