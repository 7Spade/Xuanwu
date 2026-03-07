import { WorkspaceSchedule, WorkspaceTimeline } from "@/features/workforce-scheduling.slice"

/**
 * Module: page.tsx
 * Purpose: Workspace schedule capability route.
 * Responsibilities: render merged workspace schedule and timeline views.
 * Constraints: deterministic logic, respect module boundaries
 */

export default function ScheduleCapabilityPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border bg-card/20 p-4 md:p-5">
        <WorkspaceSchedule />
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card/20 p-4 md:p-5">
        <WorkspaceTimeline />
      </section>
    </div>
  )
}
