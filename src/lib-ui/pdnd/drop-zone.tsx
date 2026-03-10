/**
 * Module: pdnd-drop-zone
 * Purpose: Provide a declarative drop zone using @atlaskit/pragmatic-drag-and-drop.
 * Responsibilities: register a DOM element as a drop target and expose drag-over state
 *   with a standard visual indicator using the project's ring aesthetic.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

import { cn } from "@/shadcn-ui/utils/utils"

export interface PdndDropData {
  [key: string | symbol]: unknown
}

interface PdndDropZoneProps {
  onDrop: (sourceData: PdndDropData) => void
  children: ReactNode
  className?: string
  activeClassName?: string
}

export function PdndDropZone({
  onDrop,
  children,
  className,
  activeClassName,
}: PdndDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        setIsDraggedOver(false)
        onDrop(source.data as PdndDropData)
      },
    })
  }, [onDrop])

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-all duration-150",
        isDraggedOver
          ? (activeClassName ?? "ring-2 ring-primary/60 bg-primary/5")
          : "ring-1 ring-zinc-300/50 dark:ring-white/10",
        className,
      )}
    >
      {children}
    </div>
  )
}
