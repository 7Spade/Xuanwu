/**
 * shared.kernel/schedule-contract — SK_SCHEDULE_CONTRACT [D19]
 *
 * Cross-BC canonical types for the Schedule domain.
 * Per D19 (docs/logic-overview.md): cross-BC contracts belong in shared.kernel.*;
 * shared/types is legacy fallback only.
 *
 * ScheduleItem and ScheduleStatus are referenced by:
 *   – scheduling.slice  (domain aggregate + actions)
 *   – projection.bus/demand-board  (projector read model)
 *   – workspace.slice/scheduling  (create/view)
 *   – projection.bus/account-schedule  (account projector)
 *   – shared/types/ stubs have been removed; import directly from @/features/shared-kernel.
 *
 * [D8] This module is pure — no async functions, no Firestore calls, no side effects.
 * [D19] Move rule: once a type is used by more than one BC, it must live here.
 */

export type { Location } from './location';
export type { ScheduleStatus, ScheduleTemporalKind } from './status';
export type { ScheduleItem } from './schedule-item';
