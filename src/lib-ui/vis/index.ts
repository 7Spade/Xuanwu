/**
 * Module: vis-index
 * Purpose: Public barrel for lib-ui vis visualization building blocks.
 * Responsibilities: re-export all vis canvas components, props types, the shared
 *   VisCompatibleDataSet<T> contract, and the vis-network/vis-timeline domain types
 *   that consumers need to build node/edge/item data.
 * Constraints: deterministic logic, respect module boundaries.
 *   All re-exports here keep feature slices from importing vis-* packages directly. [D24/D28]
 */

// ── Shared structural type ──────────────────────────────────────────────────
export type { VisCompatibleDataSet } from "./vis-types"

// ── vis-network ─────────────────────────────────────────────────────────────
export { VisNetworkCanvas } from "./vis-network-canvas"
export type { VisNetworkCanvasProps } from "./vis-network-canvas"

// Re-export vis-network domain types so consumers import from @/lib-ui/vis.
export type { Edge, IdType, Network, Node, Options } from "vis-network"

// ── vis-timeline ─────────────────────────────────────────────────────────────
export { VisTimelineCanvas } from "./vis-timeline-canvas"
export type {
  VisTimelineCanvasProps,
  DataGroup,
  DataItem,
  Timeline,
  TimelineItem,
  TimelineOptions,
} from "./vis-timeline-canvas"

// ── vis-graph3d ──────────────────────────────────────────────────────────────
export { VisGraph3dCanvas } from "./vis-graph3d-canvas"
export type { VisGraph3dCanvasProps } from "./vis-graph3d-canvas"
