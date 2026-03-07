import { WorkspaceSchedule, WorkspaceTimeline } from "@/features/workforce-scheduling.slice"

/**
 * Module: page.tsx
 * Purpose: Workspace schedule capability route.
 * Responsibilities: render merged workspace schedule and timeline views.
 * Constraints: deterministic logic, respect module boundaries
 */

export default function ScheduleCapabilityPage() {
  return (
    <div className="space-y-6">
      <WorkspaceSchedule />
      <WorkspaceTimeline />
    </div>
  )
}
