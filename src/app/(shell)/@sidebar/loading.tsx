/**
 * Module: @sidebar/loading
 * Purpose: Provide skeleton fallback for sidebar parallel slot while shell streams.
 * Responsibilities: keep global shell frame stable during slot hydration.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";

export default function SidebarSlotLoading() {
  return (
    <aside className="flex h-screen w-64 flex-col gap-4 bg-background/70 px-3 py-3 ring-1 ring-zinc-300/50 backdrop-blur-sm dark:ring-white/10">
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-9 rounded-lg" />
      <Skeleton className="h-9 rounded-lg opacity-90" />
      <Skeleton className="h-9 rounded-lg opacity-80" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-8 rounded-lg" />
        <Skeleton className="h-8 rounded-lg opacity-85" />
      </div>
      <div className="mt-auto">
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </aside>
  );
}
