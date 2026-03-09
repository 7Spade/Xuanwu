/**
 * workforce-scheduling.slice — Public API
 *
 * Unified VS6 Scheduling vertical slice.
 * Domain: accounts/{orgId}/schedule_items (single source of truth)
 * Staleness: DEMAND_BOARD ≤ 5s | STANDARD ≤ 10s (SK_STALENESS_CONTRACT)
 *
 * External consumers import exclusively from this file.
 */

// Layered API surfaces. Keep this file as the single import entry for consumers.
export * from './core';
export * from './domain.application';
export * from './domain.ui';

// Ports are exported for boundary-aligned migration to L2/L6/L4 adapters.
export type * from './domain.ports';
