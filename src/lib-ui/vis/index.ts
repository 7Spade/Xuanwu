/**
 * Module: vis-index
 * Purpose: Public barrel for lib-ui vis visualization building blocks.
 * Responsibilities: re-export vis-network, vis-timeline, vis-graph3d component contracts
 *   and the vis-network domain types consumers need to build node/edge data.
 * Constraints: deterministic logic, respect module boundaries.
 *   Type re-exports keep feature slices from importing vis-* packages directly [D24/D28].
 */
export { VisNetworkCanvas } from "./vis-network-canvas"
export type { VisNetworkCanvasProps } from "./vis-network-canvas"
export { VisTimelineCanvas } from "./vis-timeline-canvas"
export { VisGraph3dCanvas } from "./vis-graph3d-canvas"

// Re-export vis-network types so consumers import from @/lib-ui/vis, not vis-network directly.
export type { Edge, IdType, Network, Node, Options } from "vis-network"
