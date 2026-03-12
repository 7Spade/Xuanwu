/**
 * Module: workspaces/loading
 * Purpose: Provide route-level loading UX for workspaces list and parallel slots.
 * Responsibilities: keep shell continuity with low-noise skeleton blocks.
 * Constraints: deterministic logic, respect module boundaries
 */
import { NexusSkeletonBlock, RouteStreamShell } from "@/lib-ui/custom-ui";

export default function WorkspacesRouteLoading() {
  return (
    <RouteStreamShell>
      <NexusSkeletonBlock rows={2} className="bg-transparent p-0 ring-0" />
      <NexusSkeletonBlock rows={1} />
      <NexusSkeletonBlock rows={4} />
    </RouteStreamShell>
  );
}
