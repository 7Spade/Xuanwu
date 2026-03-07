/**
 * Module: account-event-bus
 * Purpose: Provide VS2 in-process account event bus contracts and pub/sub APIs
 * Responsibilities: publish and subscribe account lifecycle events before outbox delivery
 * Constraints: deterministic logic, respect module boundaries
 */

export interface AccountCreatedPayload {
  accountId: string;
  traceId?: string;
}

export interface AccountRoleChangedPayload {
  accountId: string;
  orgId: string;
  role: string;
  changeType: 'assigned' | 'revoked';
  changedBy: string;
  traceId?: string;
}

export interface AccountPolicyChangedPayload {
  accountId: string;
  policyId: string;
  changeType: 'created' | 'updated' | 'deleted';
  changedBy: string;
  traceId?: string;
}

export interface WalletDebitedPayload {
  accountId: string;
  amount: number;
  currency?: string;
  traceId?: string;
}

export interface WalletCreditedPayload {
  accountId: string;
  amount: number;
  currency?: string;
  traceId?: string;
}

export interface AccountEventPayloadMap {
  'account:created': AccountCreatedPayload;
  'account:role:changed': AccountRoleChangedPayload;
  'account:policy:changed': AccountPolicyChangedPayload;
  'account:wallet:debited': WalletDebitedPayload;
  'account:wallet:credited': WalletCreditedPayload;
}

export type AccountEventKey = keyof AccountEventPayloadMap;

type AccountEventHandler<K extends AccountEventKey> =
  (payload: AccountEventPayloadMap[K]) => void | Promise<void>;

type AccountEventHandlerMap = {
  [K in AccountEventKey]?: Array<AccountEventHandler<K>>;
};

const handlers: AccountEventHandlerMap = {};

export function onAccountEvent<K extends AccountEventKey>(
  eventKey: K,
  handler: AccountEventHandler<K>,
): () => void {
  if (!handlers[eventKey]) {
    (handlers as Record<string, unknown[]>)[eventKey] = [];
  }
  (handlers[eventKey] as Array<AccountEventHandler<K>>).push(handler);

  return () => {
    const list = handlers[eventKey] as Array<AccountEventHandler<K>> | undefined;
    if (!list) return;
    const index = list.indexOf(handler);
    if (index !== -1) list.splice(index, 1);
  };
}

export async function publishAccountEvent<K extends AccountEventKey>(
  eventKey: K,
  payload: AccountEventPayloadMap[K],
): Promise<void> {
  const list = handlers[eventKey] as Array<AccountEventHandler<K>> | undefined;
  if (!list?.length) return;
  await Promise.allSettled(list.map((handler) => handler(payload)));
}
