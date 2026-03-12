/**
 * Module: drag-handle
 * Purpose: Render an accessible drag handle button for sortable list items.
 * Responsibilities: forward @dnd-kit listeners and attributes onto a styled grip icon button.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import type { DragHandleProps } from "./sortable-list"

interface DragHandleButtonProps extends DragHandleProps {
  label?: string
}

export function DragHandle({ listeners, attributes, isDragging, label = "Drag to reorder" }: DragHandleButtonProps) {
  return (
    <button
      type="button"
      className="flex cursor-grab items-center rounded p-1 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      aria-label={label}
      {...listeners}
      {...attributes}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </button>
  )
}
