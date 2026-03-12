/**
 * Module: nexus-dialog-shell
 * Purpose: Provide a reusable dialog frame with title, description, and action/footer slots.
 * Responsibilities: compose dialog primitives with cohesive spacing and border optics.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shadcn-ui/dialog"
import { cn } from "@/shadcn-ui/utils/utils"

interface NexusDialogShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  titleClassName?: string
  bodyClassName?: string
}

export function NexusDialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
  titleClassName,
  bodyClassName,
}: NexusDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!left-1/2 !top-1/2 !translate-x-[-50%] !translate-y-[-50%] w-[min(92vw,42rem)] rounded-2xl bg-background/96 p-6 shadow-2xl ring-1 ring-zinc-300/50 backdrop-blur-xl dark:ring-white/10",
          contentClassName,
        )}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className={cn("text-xl tracking-tight", titleClassName)}>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className={cn("space-y-4", bodyClassName)}>{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
