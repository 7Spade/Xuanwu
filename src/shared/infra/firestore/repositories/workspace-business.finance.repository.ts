/**
 * @fileoverview Workspace Business — Finance Aggregate Repository.
 *
 * Stores and retrieves persisted finance aggregate state for a workspace.
 * Path: financeStates/{workspaceId}
 */

import { getDocument } from '../firestore.read.adapter';
import { setDocument } from '../firestore.write.adapter';

interface PersistedFinanceDirectiveItem {
  id: string;
  name: string;
  sourceDocument: string;
  intentId: string;
  semanticTagSlug: string;
  costItemType: string;
  unitPrice: number;
  totalQuantity: number;
  remainingQuantity: number;
}

interface PersistedFinanceClaimLineItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface PersistedFinanceAggregateState {
  workspaceId: string;
  stage: string;
  cycleIndex: number;
  receivedAmount: number;
  directiveItems: PersistedFinanceDirectiveItem[];
  currentClaimLineItems: PersistedFinanceClaimLineItem[];
  paymentTermStartAtISO: string | null;
  paymentReceivedAtISO: string | null;
  updatedAt: number;
}

const financeAggregatePath = (workspaceId: string) => `financeStates/${workspaceId}`;

export async function getFinanceAggregateState(
  workspaceId: string,
): Promise<PersistedFinanceAggregateState | null> {
  return getDocument<PersistedFinanceAggregateState>(financeAggregatePath(workspaceId));
}

export async function saveFinanceAggregateState(
  state: PersistedFinanceAggregateState,
): Promise<void> {
  await setDocument(financeAggregatePath(state.workspaceId), state);
}
