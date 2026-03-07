/**
 * Module: timeline-capability-tabs.tsx
 * Purpose: Backward-compatible exports for timeline capability tabs.
 * Responsibilities: preserve existing API while delegating to unified implementation.
 * Constraints: deterministic logic, respect module boundaries
 */

import { WorkspaceScheduleTimelineTabs } from "./workspace-schedule-timeline-tabs";

/**
 * @deprecated AccountTimelineCapabilityTabs is no longer rendered by any route.
 * The unified WorkforceSchedulingPage at /dashboard/account/workforce-scheduling
 * manages schedule/timeline switching with in-page state.
 * This export is kept to avoid a breaking public-API change.
 */
export function AccountTimelineCapabilityTabs() {
  return null;
}

export function WorkspaceTimelineCapabilityTabs() {
  return <WorkspaceScheduleTimelineTabs />;
}
