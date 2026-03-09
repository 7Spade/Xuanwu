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

interface NexusDialogShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function NexusDialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: NexusDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl bg-background/96 p-6 shadow-2xl ring-1 ring-zinc-300/50 backdrop-blur-xl dark:ring-white/10">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl tracking-tight">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
