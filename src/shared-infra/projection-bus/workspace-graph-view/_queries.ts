/**
 * Module: workspace-graph-view/_queries.ts
 * Purpose: Read queries for the workspace graph view [D28]
 * Responsibilities: Retrieve graph topology for vis-network visualization
 * Constraints: deterministic logic, respect module boundaries
 */

import { getDocument } from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';

import type { WorkspaceGraphView, GraphNode, GraphEdge } from './_projector';

/**
 * Get the full graph view for a workspace [D28].
 */
export async function getWorkspaceGraphView(
  workspaceId: string
): Promise<WorkspaceGraphView | null> {
  return getDocument<WorkspaceGraphView>(`workspaceGraphView/${workspaceId}`);
}

/**
 * Get only the nodes for a workspace graph.
 */
export async function getWorkspaceGraphNodes(workspaceId: string): Promise<GraphNode[]> {
  const view = await getWorkspaceGraphView(workspaceId);
  return view?.nodes ?? [];
}

/**
 * Get only the edges for a workspace graph.
 */
export async function getWorkspaceGraphEdges(workspaceId: string): Promise<GraphEdge[]> {
  const view = await getWorkspaceGraphView(workspaceId);
  return view?.edges ?? [];
}
