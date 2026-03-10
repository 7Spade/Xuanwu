/**
 * Module: pdnd-draggable
 * Purpose: Make any element draggable using @atlaskit/pragmatic-drag-and-drop.
 * Responsibilities: register a DOM element as a draggable source and manage
 *   dragging state for visual feedback.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

import { cn } from "@/shadcn-ui/utils/utils"

export interface PdndDragData {
  [key: string | symbol]: unknown
}

interface PdndDraggableProps {
  data: PdndDragData
  children: ReactNode
  className?: string
  draggingClassName?: string
}

export function PdndDraggable({
  data,
  children,
  className,
  draggingClassName,
}: PdndDraggableProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return draggable({
      element: el,
      getInitialData: () => data,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [data])

  return (
    <div
      ref={ref}
      className={cn(
        "cursor-grab transition-opacity active:cursor-grabbing",
        isDragging ? (draggingClassName ?? "opacity-40") : "opacity-100",
        className,
      )}
    >
      {children}
    </div>
  )
}
