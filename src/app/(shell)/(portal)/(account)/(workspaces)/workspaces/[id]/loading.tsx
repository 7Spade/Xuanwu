/**
 * Module: workspace/[id]/loading
 * Purpose: Keep workspace detail shell stable while parallel business tabs stream.
 * Responsibilities: render low-jank placeholders for header and tab-content regions.
 * Constraints: deterministic logic, respect module boundaries
 */
import { NexusSkeletonBlock, RouteStreamShell } from "@/lib-ui/custom-ui";

export default function WorkspaceDetailRouteLoading() {
  return (
    <RouteStreamShell>
      <NexusSkeletonBlock rows={3} className="bg-transparent p-0 ring-0" />
      <NexusSkeletonBlock rows={1} />
      <NexusSkeletonBlock rows={5} />
    </RouteStreamShell>
  );
}
