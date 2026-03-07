/**
 * Module: firebase-context.ts
 * Purpose: define firebase provider context contract and shared firebase types
 * Responsibilities: own firebase context shape and exported type contracts
 * Constraints: deterministic logic, respect module boundaries
 */

import { type FirebaseApp } from 'firebase/app'
import { type Auth } from 'firebase/auth'
import { type Firestore } from 'firebase/firestore'
import { type FirebaseStorage } from 'firebase/storage'
import { createContext } from 'react'

export interface FirebaseContextType {
  app: FirebaseApp
  db: Firestore
  auth: Auth
  storage: FirebaseStorage
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null)
