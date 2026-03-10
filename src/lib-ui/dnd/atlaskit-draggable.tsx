/**
 * Module: dnd-atlaskit-draggable-compat
 * Purpose: Backward-compatible shim for legacy dnd import path.
 * Responsibilities: re-export Pragmatic DnD draggable contract from the pdnd module.
 * Constraints: deterministic logic, respect module boundaries
 */

export {
  PdndDraggable as AtlaskitDraggable,
  type PdndDragData as AtlaskitDragData,
} from "../pdnd"
