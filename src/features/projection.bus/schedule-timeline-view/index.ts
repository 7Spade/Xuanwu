/**
 * projection.schedule-timeline-view — Public API
 *
 * Resource-dimension schedule timeline read model (TL_PROJ) [L5-Bus].
 * Feeds QGWAY_TL in infra.gateway-query.
 *
 * Per 00-LogicOverview.md:
 *   TL_PROJ -.-> QGWAY_TL
 *   "資源維度 Read Model [L5-Bus]": resource groups + pre-computed overlap detection.
 *   "applyVersionGuard() [S2]": idempotent projection writes.
 */

export { projectScheduleTimelineView } from './_projector';
export { getScheduleTimelineView } from './_queries';
export type {
  ScheduleTimelineViewRecord,
  ScheduleTimelineResourceGroup,
  ScheduleTimelineItem,
} from './_projector';
