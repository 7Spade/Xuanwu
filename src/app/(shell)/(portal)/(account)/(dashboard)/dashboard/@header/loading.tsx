/**
 * Module: dashboard/@header/loading
 * Purpose: Provide a lightweight skeleton header while header slot hydrates.
 * Responsibilities: avoid header jump during parallel route transitions.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";

export default function DashboardHeaderSlotLoading() {
  return (
    <div className="flex h-16 items-center gap-3 px-4 ring-1 ring-zinc-300/50 dark:ring-white/10">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-4 w-52 rounded-md" />
      <div className="ml-auto flex items-center gap-3">
        <Skeleton className="h-9 w-80 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}
