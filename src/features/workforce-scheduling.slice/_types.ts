/**
 * Module: _types.ts
 * Purpose: Local type contracts for workforce-scheduling.slice.
 * Responsibilities: Define lightweight types used by calendar and timeline rendering.
 * Constraints: All cross-domain types must live in shared-kernel [D19].
 */

/**
 * Lightweight member reference used by CalendarView and TimelineView renderers.
 * TODO: promote to shared-kernel once the Account member read-model is finalised [D19].
 */
export interface WorkforceMember {
  id: string;
  name: string;
}

/**
 * Lightweight member reference used by timeline rendering.
 * Origin: timelineing.slice/_types.ts
 */
export interface TimelineMember {
  id: string;
  name: string;
}
