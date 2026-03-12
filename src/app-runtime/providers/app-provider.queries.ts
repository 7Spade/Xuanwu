/**
 * Module: app-provider.queries.ts
 * Purpose: firestore subscription factories for app-provider
 * Responsibilities: provide app-level account subscriptions without UI coupling
 * Constraints: deterministic logic, respect module boundaries
 */

import { db } from '@/shared-infra/firebase-client'
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  type Unsubscribe,
  where,
} from '@/shared-infra/firebase-client/firestore/firestore.read.adapter'
import { snapshotToRecord } from '@/shared-infra/firebase-client/firestore/firestore.utils'
import type { Account } from '@/shared-kernel'

export function subscribeToAccountsForUser(
  userId: string,
  onUpdate: (accounts: Record<string, Account>) => void,
): Unsubscribe {
  const memberAccountQuery = query(
    collection(db, 'accounts'),
    where('memberIds', 'array-contains', userId),
  )

  const ownerAccountQuery = query(
    collection(db, 'accounts'),
    where('ownerId', '==', userId),
  )

  let memberAccounts: Record<string, Account> = {}
  let ownerAccounts: Record<string, Account> = {}

  let hasEmitted = false
  const emit = (accounts: Record<string, Account>) => {
    hasEmitted = true
    onUpdate(accounts)
  }

  const emitMerged = () => {
    emit({
      ...memberAccounts,
      ...ownerAccounts,
    })
  }

  // Warm-up read to avoid a blank switcher while waiting for the realtime stream.
  void Promise.all([getDocs(memberAccountQuery), getDocs(ownerAccountQuery)])
    .then(([memberSnap, ownerSnap]) => {
      memberAccounts = snapshotToRecord<Account>(memberSnap)
      ownerAccounts = snapshotToRecord<Account>(ownerSnap)
      if (!hasEmitted) emitMerged()
    })
    .catch(() => {
      // Realtime listener below remains the source of truth; ignore warm-up failures.
    })

  const unsubMembers = onSnapshot(memberAccountQuery, (snap) => {
    memberAccounts = snapshotToRecord<Account>(snap)
    emitMerged()
  })

  const unsubOwners = onSnapshot(ownerAccountQuery, (snap) => {
    ownerAccounts = snapshotToRecord<Account>(snap)
    emitMerged()
  })

  return () => {
    unsubMembers()
    unsubOwners()
  }
}
