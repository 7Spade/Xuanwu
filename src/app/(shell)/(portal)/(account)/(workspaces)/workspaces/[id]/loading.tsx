/**
 * Module: workspace/[id]/loading
 * Purpose: Keep workspace detail shell stable while parallel business tabs stream.
 * Responsibilities: render low-jank placeholders for header and tab-content regions.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";

export default function WorkspaceDetailRouteLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-2xl bg-background/60 p-6 ring-1 ring-border/55 backdrop-blur-sm">
      <div className="space-y-3">
        <Skeleton className="h-4 w-44 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-5 w-96 rounded-md" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
