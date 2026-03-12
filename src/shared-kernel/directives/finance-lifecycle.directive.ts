/**
 * Module: finance-lifecycle.directive.ts
 * Purpose: Canonical lifecycle directives for finance claim flow.
 * Responsibilities: define guard/normalization directives for finance lifecycle states.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { FinanceLifecycleStage } from '@/shared-kernel/types/finance';

export function isActiveParsingIntentStatus(status: string | undefined): boolean {
  return status === 'pending'
    || status === 'importing'
    || status === 'imported'
    || status === 'failed';
}

export function normalizeLifecycleStage(stage: string | undefined): FinanceLifecycleStage {
  if (
    stage === 'claim-preparation'
    || stage === 'claim-submitted'
    || stage === 'claim-approved'
    || stage === 'invoice-requested'
    || stage === 'payment-term'
    || stage === 'payment-received'
    || stage === 'completed'
  ) {
    return stage;
  }
  return 'claim-preparation';
}

export function getNextStageFromAction(currentStage: FinanceLifecycleStage): FinanceLifecycleStage {
  if (currentStage === 'claim-submitted') return 'claim-approved';
  if (currentStage === 'claim-approved') return 'invoice-requested';
  if (currentStage === 'invoice-requested') return 'payment-term';
  if (currentStage === 'payment-term') return 'payment-received';
  return currentStage;
}
