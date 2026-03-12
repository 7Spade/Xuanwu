/**
 * Module: parallel-slot-header-loading
 * Purpose: Provide a shared loading skeleton for App Router parallel slot headers.
 * Responsibilities: centralize header loading optics and avoid duplicated slot-specific markup.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Skeleton } from "@/shadcn-ui/skeleton";
import { cn } from "@/shadcn-ui/utils/utils";

interface ParallelSlotHeaderLoadingProps {
  titleWidthClassName?: string;
  searchWidthClassName?: string;
  className?: string;
}

export function ParallelSlotHeaderLoading({
  titleWidthClassName = "w-52",
  searchWidthClassName = "w-80",
  className,
}: ParallelSlotHeaderLoadingProps) {
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-3 rounded-xl bg-background/70 px-4 shadow-sm ring-1 ring-zinc-300/50 backdrop-blur-sm dark:ring-white/10",
        className,
      )}
    >
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className={cn("h-4 rounded-md", titleWidthClassName)} />
      <div className="ml-auto flex items-center gap-3">
        <Skeleton className={cn("h-9 rounded-xl", searchWidthClassName)} />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}
