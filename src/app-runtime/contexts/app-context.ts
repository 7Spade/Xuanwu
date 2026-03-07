/**
 * Module: app-context.ts
 * Purpose: define app provider context contract and shared state/action types
 * Responsibilities: own context shape and exported app-level type contracts
 * Constraints: deterministic logic, respect module boundaries
 */

import { createContext, type Dispatch } from 'react'

import type { CapabilitySpec } from '@/features/workspace.slice'
import { type Account, type Notification } from '@/shared-kernel'

export interface AppState {
  accounts: Record<string, Account>
  activeAccount: Account | null
  notifications: Notification[]
  capabilitySpecs: CapabilitySpec[]
  scheduleTaskRequest: { taskName: string; workspaceId: string } | null
}

export type AppAction =
  | { type: 'SET_ACCOUNTS'; payload: { accounts: Record<string, Account>; user: Account } }
  | { type: 'SET_ACTIVE_ACCOUNT'; payload: Account | null }
  | { type: 'RESET_STATE' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'REQUEST_SCHEDULE_TASK'; payload: { taskName: string; workspaceId: string } }
  | { type: 'CLEAR_SCHEDULE_TASK_REQUEST' }

export interface AppContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const AppContext = createContext<AppContextValue | null>(null)

export { AppProvider, useApp } from '../providers/app-provider'
