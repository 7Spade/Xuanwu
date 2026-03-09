/**
 * Module: workspace-graph-view/index.ts
 * Purpose: Workspace graph view projection public API [D28]
 * Responsibilities: Export projector and queries for the task dependency topology read model
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.workspace-graph-view — Public API [D28]
 *
 * Task dependency topology read model. Standard projection (SLA ≤ 10s).
 * Consumed by VS5 vis-network via VisDataAdapter.
 */

export { applyGraphNodeUpserted, applyGraphEdgeUpserted, applyGraphNodeRemoved } from './_projector';
export type { WorkspaceGraphView, GraphNode, GraphEdge } from './_projector';

export { getWorkspaceGraphView, getWorkspaceGraphNodes, getWorkspaceGraphEdges } from './_queries';
