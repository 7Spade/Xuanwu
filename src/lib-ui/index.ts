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
  type DragHandleProps,
  type AtlaskitDropData,
  type AtlaskitDragData,
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
