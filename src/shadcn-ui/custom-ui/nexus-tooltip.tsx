/**
 * Module: nexus-tooltip
 * Purpose: Provide project-wide tooltip wrapper with default delay and border optics.
 * Responsibilities: centralize tooltip provider/content defaults while keeping trigger flexible.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import type { ReactNode } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shadcn-ui/tooltip"

interface NexusTooltipProps {
  content: ReactNode
  children: ReactNode
}

export function NexusTooltip({ content, children }: NexusTooltipProps) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="rounded-lg border-none bg-popover/95 px-3 py-1.5 text-xs shadow-lg ring-1 ring-zinc-300/50 backdrop-blur-md dark:ring-white/10">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
