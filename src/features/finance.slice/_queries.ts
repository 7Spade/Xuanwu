/**
 * Module: _queries.ts
 * Purpose: Read finance aggregate state from persistence layer.
 * Responsibilities: delegate getFinanceAggregateState to Firestore facade.
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  getFinanceAggregateState as getFinanceAggregateStateFacade,
} from '@/shared-infra/frontend-firebase/firestore/firestore.facade';

import type { FinanceAggregateState } from './_types';

export async function getFinanceAggregateState(
  workspaceId: string,
): Promise<FinanceAggregateState | null> {
  return getFinanceAggregateStateFacade(workspaceId) as Promise<FinanceAggregateState | null>;
}
