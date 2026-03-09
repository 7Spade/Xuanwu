/**
 * Module: nexus-skeleton-block
 * Purpose: Provide a reusable skeleton block set for card/list/table loading surfaces.
 * Responsibilities: centralize skeleton arrangement presets used by route/component loaders.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton"
import { cn } from "@/shadcn-ui/utils/utils"

interface NexusSkeletonBlockProps {
  rows?: number
  className?: string
}

export function NexusSkeletonBlock({ rows = 4, className }: NexusSkeletonBlockProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl bg-background/70 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.4)] ring-1 ring-zinc-300/55 backdrop-blur-sm transition-all duration-150 ease-out dark:ring-white/10",
        className,
      )}
    >
      <Skeleton className="h-6 w-2/5" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={`skeleton-row-${index}`} className="h-10 w-full" />
      ))}
    </div>
  )
}
