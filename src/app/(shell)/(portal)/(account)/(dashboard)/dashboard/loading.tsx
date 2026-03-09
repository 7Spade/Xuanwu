/**
 * Module: dashboard/loading
 * Purpose: Provide a non-blocking route-level loading boundary for dashboard parallel routes.
 * Responsibilities: render shell-friendly skeletons while route segments stream.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";

export default function DashboardRouteLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-2xl bg-background/60 p-6 ring-1 ring-border/55 backdrop-blur-sm">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
