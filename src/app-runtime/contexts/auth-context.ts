"use client"

/**
 * Module: auth-context.ts
 * Purpose: define auth provider context contract and shared auth types
 * Responsibilities: own auth context shape and exported auth type contracts
 * Constraints: deterministic logic, respect module boundaries
 */

import { createContext, type Dispatch } from 'react'

import { type Account } from '@/shared-kernel'

export interface AuthState {
  user: Account | null
  authInitialized: boolean
}

export type AuthAction =
  | { type: 'SET_AUTH_STATE'; payload: { user: Account | null; initialized: boolean } }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<Account> }

export interface AuthContextValue {
  state: AuthState
  dispatch: Dispatch<AuthAction>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
