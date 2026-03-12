/**
 * Module: nexus-separator
 * Purpose: Provide a soft separator preset for high-contrast layouts without harsh borders.
 * Responsibilities: wrap separator primitive and apply zinc/white ring-like optics.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Separator } from "@/shadcn-ui/separator"
import { cn } from "@/shadcn-ui/utils/utils"

interface NexusSeparatorProps {
  className?: string
  orientation?: "horizontal" | "vertical"
}

export function NexusSeparator({
  className,
  orientation = "horizontal",
}: NexusSeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      className={cn(
        "bg-zinc-300/55 dark:bg-white/10",
        orientation === "horizontal" ? "my-4 h-px w-full" : "mx-3 h-full w-px",
        className,
      )}
    />
  )
}
