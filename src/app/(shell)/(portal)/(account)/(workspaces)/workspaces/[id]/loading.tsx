/**
 * Module: workspace/[id]/loading
 * Purpose: Keep workspace detail shell stable while parallel business tabs stream.
 * Responsibilities: render low-jank placeholders for header and tab-content regions.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";
import { RouteStreamShell } from "@/app/(shell)/(portal)/(account)/_components/route-stream-shell";

export default function WorkspaceDetailRouteLoading() {
  return (
    <RouteStreamShell>
      <div className="space-y-3">
        <Skeleton className="h-4 w-44 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-5 w-96 rounded-md opacity-85" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl opacity-90" />
        <Skeleton className="h-24 rounded-xl opacity-80" />
      </div>
    </RouteStreamShell>
  );
}
