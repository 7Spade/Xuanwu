/**
 * Module: vis-data/vis-data.adapter.ts
 * Purpose: VisDataAdapter — L7-A vis-data DataSet<> local cache [D28]
 * Responsibilities: Bridge Firebase Snapshot subscriptions to vis-network/timeline/graph3d DataSet<> format
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * infra.frontend-firebase.vis-data — vis-data.adapter.ts
 *
 * [D28] VisDataAdapter — L7-A vis-data DataSet<> local cache.
 *
 * Per 01-logical-flow.md [D28]:
 *   VIS_DATA_ADP["vis-data.adapter.ts\nVisDataAdapter\n
 *     DataSet<Node|Edge|DataItem> 本地快取\n
 *     [D28] 唯一 vis-* DataSet 寫入點\n
 *     Firebase Snapshot 訂閱一次 → DataSet 更新推播\n
 *     vis-network / vis-timeline / vis-graph3d 唯讀消費\n
 *     禁止 vis-* 直連 Firebase（N×1 連線 → 費用倍增）[D28]"]
 *
 * Invariants:
 *   [D24] Only legal vis-data writing point.
 *   [D28] vis-network / vis-timeline / vis-graph3d consume read-only from this adapter.
 *   Prohibit vis-* from connecting directly to Firebase (N×1 connections = cost multiplication).
 */

// ---------------------------------------------------------------------------
// Generic DataSet shim (compatible with vis-data DataSet<> interface)
// ---------------------------------------------------------------------------

/**
 * Minimal subset of the vis-data DataSet API used by this adapter.
 * The actual vis-data library is consumed at the call site; we only reference the interface.
 */
export interface VisDataSet<T> {
  add(data: T | T[]): unknown;
  update(data: T | T[]): unknown;
  remove(id: string | string[]): unknown;
  get(id?: string): T | T[] | null;
  clear(): void;
}

// ---------------------------------------------------------------------------
// Node / Edge types for graph views [D28]
// ---------------------------------------------------------------------------

export interface VisNode {
  id: string;
  label: string;
  group?: string;
  [key: string]: unknown;
}

export interface VisEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// VisDataAdapter
// ---------------------------------------------------------------------------

export interface VisDataAdapterOptions {
  /** Provide a factory so this adapter doesn't import vis-data directly. */
  createNodeDataSet: () => VisDataSet<VisNode>;
  createEdgeDataSet: () => VisDataSet<VisEdge>;
}

/**
 * VisDataAdapter — L7-A.
 *
 * Bridges Firebase workspace-graph-view projection snapshot updates into
 * vis-data DataSet<> local caches consumed by vis-network/vis-graph3d [D28].
 *
 * Usage:
 * ```ts
 * const adapter = createVisDataAdapter({
 *   createNodeDataSet: () => new DataSet<VisNode>(),
 *   createEdgeDataSet: () => new DataSet<VisEdge>(),
 * });
 * const unsubscribe = adapter.subscribeWorkspaceGraph(workspaceId, graphView);
 * // vis-network reads from adapter.nodeDataSet and adapter.edgeDataSet
 * ```
 */
export interface VisDataAdapter {
  /** Read-only node dataset consumed by vis-network [D28] */
  readonly nodeDataSet: VisDataSet<VisNode>;
  /** Read-only edge dataset consumed by vis-network [D28] */
  readonly edgeDataSet: VisDataSet<VisEdge>;
  /**
   * Push a graph snapshot into the DataSets.
   * Called by the Firebase snapshot subscriber — exactly one subscriber per workspace.
   * [D28] This is the only point that writes to the DataSets.
   */
  applyGraphSnapshot(nodes: VisNode[], edges: VisEdge[]): void;
  /** Reset both DataSets (e.g., on workspace switch). */
  reset(): void;
}

/**
 * Factory for creating a VisDataAdapter with injected DataSet implementations.
 * Dependency-injection keeps this file free of direct vis-data imports.
 */
export function createVisDataAdapter(opts: VisDataAdapterOptions): VisDataAdapter {
  const nodeDataSet = opts.createNodeDataSet();
  const edgeDataSet = opts.createEdgeDataSet();

  return {
    nodeDataSet,
    edgeDataSet,

    applyGraphSnapshot(nodes: VisNode[], edges: VisEdge[]): void {
      // Replace all data atomically — single subscriber pattern [D28].
      nodeDataSet.clear();
      edgeDataSet.clear();
      if (nodes.length > 0) nodeDataSet.add(nodes);
      if (edges.length > 0) edgeDataSet.add(edges);
    },

    reset(): void {
      nodeDataSet.clear();
      edgeDataSet.clear();
    },
  };
}
