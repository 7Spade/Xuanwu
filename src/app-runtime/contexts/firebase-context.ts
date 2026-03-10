"use client"

/**
 * Module: firebase-context.ts
 * Purpose: define firebase provider context contract and shared firebase types
 * Responsibilities: own firebase context shape and exported type contracts
 * Constraints: deterministic logic, respect module boundaries
 */

import { createContext } from 'react'

import { app, auth, db, storage } from '@/shared-infra/firebase-client'

export interface FirebaseContextType {
  app: typeof app
  db: typeof db
  auth: typeof auth
  storage: typeof storage
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null)
