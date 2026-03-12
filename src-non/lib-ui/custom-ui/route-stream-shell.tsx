/**
 * Module: route-stream-shell
 * Purpose: Provide a consistent non-blocking loading surface for portal route streaming.
 * Responsibilities: render ring-based container and staggered skeleton rows for App Router boundaries.
 * Constraints: deterministic logic, respect module boundaries
 */
import type { ReactNode } from "react";

import { cn } from "@/shadcn-ui/utils/utils";

interface RouteStreamShellProps {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function RouteStreamShell({ children, className, compact = false }: RouteStreamShellProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl rounded-2xl bg-background/65 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] ring-1 ring-zinc-300/55 backdrop-blur-sm dark:ring-white/10",
        compact ? "space-y-4 p-5" : "space-y-6 p-6 md:p-8",
        "animate-in fade-in duration-150 ease-out",
        className,
      )}
    >
      {children}
    </div>
  );
}
