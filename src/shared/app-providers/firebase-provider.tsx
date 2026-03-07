"use client";

/**
 * Module: firebase-provider.tsx
 * Purpose: host firebase resource provider and consumer hook
 * Responsibilities: provide app/auth/db/storage clients via context
 * Constraints: deterministic logic, respect module boundaries
 */

import { useContext, type ReactNode } from 'react';

import { app } from '@/shared/infra/app.client';
import { auth } from '@/shared/infra/auth/auth.client';
import { db } from '@/shared/infra/firestore/firestore.client';
import { storage } from '@/shared/infra/storage/storage.client';
import { FirebaseContext } from './firebase-context';

export function FirebaseClientProvider({ children }: { children: ReactNode; }) {
  const value = { app, db, auth, storage };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used within FirebaseClientProvider");
  return context;
};
