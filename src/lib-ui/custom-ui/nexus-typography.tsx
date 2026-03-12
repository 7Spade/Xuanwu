/**
 * Module: nexus-typography
 * Purpose: Provide concise typography primitives for consistent page-level semantics.
 * Responsibilities: expose title/lead/body/muted text with intentional spacing and tracking.
 * Constraints: deterministic logic, respect module boundaries
 */
import type { HTMLAttributes } from "react"

import { cn } from "@/shadcn-ui/utils/utils"

export function NexusTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-2xl font-semibold tracking-tight text-foreground md:text-3xl", className)}
      {...props}
    />
  )
}

export function NexusLead({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-base leading-7 text-muted-foreground", className)} {...props} />
}

export function NexusBody({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-foreground/90", className)} {...props} />
}

export function NexusMuted({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs tracking-tight text-muted-foreground", className)} {...props} />
}
