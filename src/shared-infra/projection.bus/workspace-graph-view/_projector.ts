/**
 * Module: workspace-graph-view/_projector.ts
 * Purpose: Workspace task dependency graph read model for vis-network
 * Responsibilities: Maintain nodes (tasks) and edges (dependencies/triggers) for graph visualization
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.workspace-graph-view — _projector.ts
 *
 * Task dependency graph read model. Standard projection (SLA ≤ 10s).
 * Consumed by VS5 vis-network visualization [D28].
 *
 * Per 01-logical-flow.md (PROJ_BUS STD_PROJ):
 *   WS_GRAPH_V["projection.workspace-graph-view
 *     任務依賴 Nodes/Edges 拓撲
 *     [VS5 vis-network 消費格式]
 *     applyVersionGuard() [S2]"]
 *
 * Stored at: workspaceGraphView/{workspaceId}
 *
 * [S2] SK_VERSION_GUARD applied before every write.
 * [R8] traceId from the originating EventEnvelope propagated.
 * [D28] Output format consumed by VisDataAdapter via vis-data DataSet<>.
 */

import { getDocument } from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';
import {
  setDocument,
  serverTimestamp,
} from '@/shared-infra/frontend-firebase/firestore/firestore.write.adapter';
import { versionGuardAllows } from '@/shared-kernel';

// ---------------------------------------------------------------------------
// Types (vis-network compatible)
// ---------------------------------------------------------------------------

/** A node in the task dependency graph [D28]. */
export interface GraphNode {
  id: string;
  label: string;
  status: string;
  /** Group for vis-network visual clustering */
  group?: string;
}

/** An edge in the task dependency graph [D28]. */
export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  /** Edge type: DEPENDS_ON | TRIGGERS */
  type: 'DEPENDS_ON' | 'TRIGGERS';
}

export interface WorkspaceGraphView {
  workspaceId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Last aggregate version processed [S2] */
  lastProcessedVersion: number;
  /** TraceId from the originating EventEnvelope [R8] */
  traceId?: string;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

function docPath(workspaceId: string): string {
  return `workspaceGraphView/${workspaceId}`;
}

/**
 * Upsert a task node in the graph view [D28].
 * [S2] versionGuardAllows enforced before write.
 */
export async function applyGraphNodeUpserted(
  workspaceId: string,
  node: GraphNode,
  aggregateVersion: number,
  traceId?: string
): Promise<void> {
  const existing = await getDocument<WorkspaceGraphView>(docPath(workspaceId));

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })
  ) {
    return;
  }

  const nodes = existing?.nodes ?? [];
  const edges = existing?.edges ?? [];
  const idx = nodes.findIndex((n) => n.id === node.id);
  const updatedNodes =
    idx >= 0 ? nodes.map((n) => (n.id === node.id ? node : n)) : [...nodes, node];

  await setDocument(docPath(workspaceId), {
    workspaceId,
    nodes: updatedNodes,
    edges,
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Upsert a task dependency edge in the graph view [D28].
 * [S2] versionGuardAllows enforced before write.
 */
export async function applyGraphEdgeUpserted(
  workspaceId: string,
  edge: GraphEdge,
  aggregateVersion: number,
  traceId?: string
): Promise<void> {
  const existing = await getDocument<WorkspaceGraphView>(docPath(workspaceId));

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })
  ) {
    return;
  }

  const nodes = existing?.nodes ?? [];
  const edges = existing?.edges ?? [];
  const idx = edges.findIndex((e) => e.id === edge.id);
  const updatedEdges =
    idx >= 0 ? edges.map((e) => (e.id === edge.id ? edge : e)) : [...edges, edge];

  await setDocument(docPath(workspaceId), {
    workspaceId,
    nodes,
    edges: updatedEdges,
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove a node and all its connected edges from the graph view.
 */
export async function applyGraphNodeRemoved(
  workspaceId: string,
  nodeId: string,
  aggregateVersion: number,
  traceId?: string
): Promise<void> {
  const existing = await getDocument<WorkspaceGraphView>(docPath(workspaceId));
  if (!existing) return;

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing.lastProcessedVersion,
    })
  ) {
    return;
  }

  await setDocument(docPath(workspaceId), {
    ...existing,
    nodes: existing.nodes.filter((n) => n.id !== nodeId),
    edges: existing.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}
