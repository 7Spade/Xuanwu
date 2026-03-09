/**
 * Module: dashboard/loading
 * Purpose: Provide a non-blocking route-level loading boundary for dashboard parallel routes.
 * Responsibilities: render shell-friendly skeletons while route segments stream.
 * Constraints: deterministic logic, respect module boundaries
 */
import { NexusSkeletonBlock, RouteStreamShell } from "@/shadcn-ui/custom-ui";

export default function DashboardRouteLoading() {
  return (
    <RouteStreamShell>
      <NexusSkeletonBlock rows={2} className="bg-transparent p-0 ring-0" />
      <NexusSkeletonBlock rows={3} />
      <NexusSkeletonBlock rows={5} />
    </RouteStreamShell>
  );
}
