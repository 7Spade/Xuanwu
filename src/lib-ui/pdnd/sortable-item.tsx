/**
 * Module: pdnd-sortable-item
 * Purpose: Provide a sortable list item that is both draggable and a drop target,
 *   using @atlaskit/pragmatic-drag-and-drop-hitbox for edge detection and
 *   @atlaskit/pragmatic-drag-and-drop-react-drop-indicator for visual feedback.
 * Responsibilities: combine draggable + drop-target + closest-edge hitbox + drop indicator
 *   into a single reusable building block for sortable lists.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"

import { cn } from "@/shadcn-ui/utils/utils"

export type { Edge }

export interface PdndSortableData {
  [key: string | symbol]: unknown
}

interface PdndSortableItemProps {
  /** Data attached to this item as both a drag source and drop target. */
  data: PdndSortableData
  /** Called when another item is dropped onto this item. */
  onDrop: (args: { sourceData: PdndSortableData; closestEdge: Edge | null }) => void
  children: ReactNode
  className?: string
  /** CSS class applied while this item is being dragged. Defaults to `"opacity-40"`. */
  draggingClassName?: string
  /**
   * Gap between adjacent items as a valid CSS size string (e.g. `"8px"`).
   * Passed to `DropIndicator` so the line is centred in the gap.
   */
  gap?: string
}

/**
 * A list item that can be dragged and dropped onto sibling items.
 *
 * - Registers the element as a **draggable** source via `@atlaskit/pragmatic-drag-and-drop`.
 * - Registers the element as a **drop target** and attaches closest-edge data via
 *   `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge`.
 * - Renders a `<DropIndicator>` from `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box`
 *   at the closest edge while a drag is active over this item.
 *
 * @example
 * ```tsx
 * <PdndSortableItem
 *   data={{ id: item.id }}
 *   onDrop={({ sourceData, closestEdge }) => reorder(sourceData.id, item.id, closestEdge)}
 *   gap="8px"
 * >
 *   <MyCard item={item} />
 * </PdndSortableItem>
 * ```
 */
export function PdndSortableItem({
  data,
  onDrop,
  children,
  className,
  draggingClassName,
  gap,
}: PdndSortableItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return combine(
      draggable({
        element: el,
        getInitialData: () => data,
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: el,
        getData: ({ input }) =>
          attachClosestEdge(data, {
            element: el,
            input,
            allowedEdges: ["top", "bottom"],
          }),
        onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: ({ self, source }) => {
          setClosestEdge(null)
          onDrop({
            sourceData: source.data as PdndSortableData,
            closestEdge: extractClosestEdge(self.data),
          })
        },
      }),
    )
  }, [data, onDrop])

  return (
    <div
      ref={ref}
      className={cn(
        "relative cursor-grab transition-opacity active:cursor-grabbing",
        isDragging ? (draggingClassName ?? "opacity-40") : "opacity-100",
        className,
      )}
    >
      {children}
      {closestEdge && <DropIndicator edge={closestEdge} gap={gap} />}
    </div>
  )
}
