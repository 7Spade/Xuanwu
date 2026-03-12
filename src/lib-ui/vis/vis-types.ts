/**
 * Module: vis-types
 * Purpose: Shared structural types for all vis-* canvas components.
 * Responsibilities: Define VisCompatibleDataSet<T> — the common DataSet contract
 *   bridging vis-data DataSet<T> and VisDataAdapter's VisDataSet<T>.
 * Constraints: pure type definitions; no runtime code; no third-party imports. [D24/D28]
 */

/**
 * Minimal DataSet interface structurally compatible with:
 *  - vis-data's `DataSet<T>`  — the actual runtime object created by VisXxxCanvas
 *    components in managed mode.
 *  - VisDataAdapter's `VisDataSet<T>`  — the minimal interface in
 *    `src/shared-infra/firebase-client/vis-data/vis-data.adapter.ts`.
 *
 * Generic parameter T preserves the item type (Node, Edge, DataItem, DataGroup, …).
 *
 * TypeScript structural typing means any object that satisfies this shape is assignable
 * here — no shared base class or explicit implementation is required.
 *
 * Usage (Firebase real-time path [D28]):
 * ```ts
 * const adapter = createVisDataAdapter({
 *   createNodeDataSet: () => new DataSet<VisNode>(),
 *   createEdgeDataSet: () => new DataSet<VisEdge>(),
 * });
 * // Later, subscribe to Firebase and call adapter.applyGraphSnapshot(nodes, edges).
 * // Pass adapter DataSets directly to VisNetworkCanvas — vis-network reacts automatically:
 * <VisNetworkCanvas
 *   nodesDataSet={adapter.nodeDataSet as VisCompatibleDataSet<Node>}
 *   edgesDataSet={adapter.edgeDataSet as VisCompatibleDataSet<Edge>}
 * />
 * ```
 */
export interface VisCompatibleDataSet<T> {
  add(data: T | T[]): void
  update(data: T | T[]): void
  remove(id: unknown): void
  clear(): void
}
