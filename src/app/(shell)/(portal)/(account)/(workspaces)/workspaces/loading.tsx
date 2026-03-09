/**
 * Module: workspaces/loading
 * Purpose: Provide route-level loading UX for workspaces list and parallel slots.
 * Responsibilities: keep shell continuity with low-noise skeleton blocks.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";

export default function WorkspacesRouteLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-2xl bg-background/60 p-6 ring-1 ring-border/55 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
