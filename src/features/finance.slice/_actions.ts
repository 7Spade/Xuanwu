/**
 * Module: _actions.ts
 * Purpose: Write finance aggregate state to persistence layer.
 * Responsibilities: delegate saveFinanceAggregateState to Firestore facade.
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  saveFinanceAggregateState as saveFinanceAggregateStateFacade,
} from '@/shared-infra/frontend-firebase/firestore/firestore.facade';

import type { FinanceAggregateState } from './_types';

export async function saveFinanceAggregateState(
  state: FinanceAggregateState,
): Promise<void> {
  await saveFinanceAggregateStateFacade(state);
}
