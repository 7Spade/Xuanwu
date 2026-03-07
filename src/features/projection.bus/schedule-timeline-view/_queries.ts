/**
 * Module: _queries.ts
 * Purpose: Read-side queries for the schedule-timeline projection view.
 * Responsibilities: fetch ScheduleTimelineViewRecord from Firestore for QGWAY_TL
 * Constraints: deterministic logic, respect module boundaries
 */

import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';

import type { ScheduleTimelineViewRecord } from './_projector';

/**
 * Returns the pre-computed schedule-timeline read model for a given dimension.
 *
 * Used by QGWAY_TL registered in infra.gateway-query.
 *
 * @param dimensionId - org/account ID that owns this timeline view
 */
export async function getScheduleTimelineView(
  dimensionId: string
): Promise<ScheduleTimelineViewRecord | null> {
  return getDocument<ScheduleTimelineViewRecord>(`scheduleTimelineView/${dimensionId}`);
}
