/**
 * Module: virtual-list
 * Purpose: Provide a performant virtualized list wrapper using @tanstack/react-virtual.
 * Responsibilities: compose useVirtualizer hook with a scrollable container and
 *   absolute-positioned item renderer for large list performance.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { useRef, type ReactNode } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

import { cn } from "@/shadcn-ui/utils/utils"

interface VirtualListProps<T> {
  items: T[]
  estimateSize: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
    >
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
