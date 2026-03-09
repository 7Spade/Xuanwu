/**
 * Module: dashboard/loading
 * Purpose: Provide a non-blocking route-level loading boundary for dashboard parallel routes.
 * Responsibilities: render shell-friendly skeletons while route segments stream.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";
import { RouteStreamShell } from "@/shadcn-ui/custom-ui/route-stream-shell";

export default function DashboardRouteLoading() {
  return (
    <RouteStreamShell>
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md opacity-85" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl opacity-90" />
        <Skeleton className="h-28 rounded-xl opacity-80" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </RouteStreamShell>
  );
}
