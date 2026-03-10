/**
 * Module: lib-ui-index
 * Purpose: Expose project-level third-party library UI building blocks from a single public entry.
 * Responsibilities: re-export dnd, vis, tanstack, and state sub-module contracts.
 * Constraints: deterministic logic, respect module boundaries
 */

// Drag-and-drop
export {
  SortableList,
  DragHandle,
  AtlaskitDropZone,
  AtlaskitDraggable,
  AtlaskitSortableItem,
  type DragHandleProps,
  type AtlaskitDropData,
  type AtlaskitDragData,
  type AtlaskitSortableData,
  type Edge,
} from "./dnd"

// Visualisation
export { VisNetworkCanvas, VisTimelineCanvas, VisGraph3dCanvas } from "./vis"

// TanStack
export {
  TanstackQueryProvider,
  QueryBoundary,
  DataTable,
  VirtualList,
  TanstackFormField,
} from "./tanstack"

// State management
export { createMachineContext, createSafeContext, createNamedStore } from "./state"

// shadcn/ui (project-level re-exports)
export { cn } from "./shadcn-ui/utils/utils"
export { Button, buttonVariants } from "./shadcn-ui/button"
export { Input } from "./shadcn-ui/input"
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./shadcn-ui/dialog"
export { Toaster } from "./shadcn-ui/toaster"

// custom project UI
export * from "./custom-ui"
