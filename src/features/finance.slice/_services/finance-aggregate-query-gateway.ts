/**
 * Module: finance-aggregate-query-gateway.ts
 * Purpose: Register and execute finance STRONG_READ aggregate query via Query Gateway.
 * Responsibilities: provide gateway route for finance-sensitive aggregate snapshot reads.
 * Constraints: deterministic logic, respect module boundaries
 */

import { getParsingIntents } from '@/shared-infra/firebase-client/firestore/firestore.facade';
import { executeQuery, registerQuery } from '@/shared-infra/gateway-query';

import type { FinanceStrongReadSnapshot } from '../_types';

export const FINANCE_STRONG_READ_QUERY_ROUTE = 'workspace-finance-strong-read';

interface FinanceStrongReadQueryParams {
  readonly workspaceId: string;
  readonly receivedAmount: number;
}

type ParsingIntentLineItem = {
  readonly subtotal?: number;
};

type ParsingIntentRecord = {
  readonly status?: string;
  readonly lineItems: ParsingIntentLineItem[];
};

let isFinanceStrongReadQueryRegistered = false;

function normalizeAmount(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return value;
}

function isActiveParsingIntentStatus(status: string | undefined): boolean {
  return status === 'pending'
    || status === 'importing'
    || status === 'imported'
    || status === 'failed';
}

export function registerFinanceStrongReadQueryHandler(): void {
  if (isFinanceStrongReadQueryRegistered) {
    return;
  }

  registerQuery(
    FINANCE_STRONG_READ_QUERY_ROUTE,
    async ({ workspaceId, receivedAmount }: FinanceStrongReadQueryParams): Promise<FinanceStrongReadSnapshot> => {
      const intents = (await getParsingIntents(workspaceId)) as ParsingIntentRecord[];
      const totalClaimableAmount = intents
        .filter((intent: ParsingIntentRecord) => isActiveParsingIntentStatus(intent.status))
        .reduce(
          (intentSum: number, intent: ParsingIntentRecord) => intentSum
            + intent.lineItems.reduce(
              (lineItemSum: number, lineItem: ParsingIntentLineItem) => lineItemSum + normalizeAmount(lineItem.subtotal),
              0,
            ),
          0,
        );
      const normalizedReceivedAmount = normalizeAmount(receivedAmount);

      return {
        readConsistencyMode: 'STRONG_READ',
        source: 'aggregate',
        totalClaimableAmount,
        receivedAmount: normalizedReceivedAmount,
        outstandingClaimableAmount: Math.max(totalClaimableAmount - normalizedReceivedAmount, 0),
      };
    },
    '[S3][#A16] workspace finance aggregate snapshot via Query Gateway',
  );

  isFinanceStrongReadQueryRegistered = true;
}

export async function executeFinanceStrongReadQuery(
  params: FinanceStrongReadQueryParams,
): Promise<FinanceStrongReadSnapshot> {
  registerFinanceStrongReadQueryHandler();
  return executeQuery<FinanceStrongReadQueryParams, FinanceStrongReadSnapshot>(
    FINANCE_STRONG_READ_QUERY_ROUTE,
    params,
  );
}
