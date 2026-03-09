/**
 * Module: sortable-list
 * Purpose: Provide a drag-sortable list wrapper using @dnd-kit/sortable.
 * Responsibilities: compose DndContext, SortableContext, and per-item useSortable hook
 *   into a project-standard draggable list surface.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import type { ReactNode } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableItem {
  id: string
}

interface SortableListProps<T extends SortableItem> {
  items: T[]
  onReorder: (activeId: string, overId: string) => void
  renderItem: (item: T, dragHandleProps: DragHandleProps) => ReactNode
  className?: string
  /** Opacity of the item being dragged (0–1). Default: 0.5 */
  draggingOpacity?: number
}

export interface DragHandleProps {
  listeners: ReturnType<typeof useSortable>["listeners"]
  attributes: ReturnType<typeof useSortable>["attributes"]
  isDragging: boolean
}

interface SortableRowProps<T extends SortableItem> {
  item: T
  renderItem: (item: T, handleProps: DragHandleProps) => ReactNode
  draggingOpacity: number
}

function SortableRow<T extends SortableItem>({ item, renderItem, draggingOpacity }: SortableRowProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? draggingOpacity : 1,
      }}
    >
      {renderItem(item, { listeners, attributes, isDragging })}
    </div>
  )
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  className,
  draggingOpacity = 0.5,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableRow key={item.id} item={item} renderItem={renderItem} draggingOpacity={draggingOpacity} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
