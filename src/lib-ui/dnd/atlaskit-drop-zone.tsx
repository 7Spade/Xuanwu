/**
 * Module: dnd-atlaskit-drop-zone-compat
 * Purpose: Backward-compatible shim for legacy dnd import path.
 * Responsibilities: re-export Pragmatic DnD drop-zone contract from the pdnd module.
 * Constraints: deterministic logic, respect module boundaries
 */

export {
  PdndDropZone as AtlaskitDropZone,
  type PdndDropData as AtlaskitDropData,
} from "../pdnd"
