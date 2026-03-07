/**
 * Module: schedule-capability-tabs.tsx
 * Purpose: Backward-compatible exports for schedule/timeline capability tabs.
 * Responsibilities: preserve existing API while delegating to unified implementation.
 * Constraints: deterministic logic, respect module boundaries
 */

import { WorkspaceScheduleTimelineTabs } from "./workspace-schedule-timeline-tabs";

/**
 * @deprecated AccountCapabilityTabs is no longer rendered by any route.
 * The unified WorkforceSchedulingPage at /dashboard/account/workforce-scheduling
 * manages schedule/timeline switching with in-page state.
 * This export is kept to avoid a breaking public-API change.
 */
export function AccountCapabilityTabs() {
  return null;
}

export function WorkspaceCapabilityTabs() {
  return <WorkspaceScheduleTimelineTabs />;
}
