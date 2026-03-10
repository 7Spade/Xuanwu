/**
 * Module: vis-data/index.ts
 * Purpose: VisDataAdapter public API [D28]
 * Responsibilities: Export VisDataAdapter for vis-network/timeline/graph3d consumption
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * infra.firebase-client.vis-data — Public API [D28]
 *
 * [D24] Unique legal vis-* DataSet writing point.
 * [D28] vis-network / vis-timeline / vis-graph3d consume read-only.
 * Firebase Snapshot subscription once → DataSet update push.
 */

export { createVisDataAdapter } from './vis-data.adapter';
export type {
  VisDataAdapter,
  VisDataAdapterOptions,
  VisDataSet,
  VisNode,
  VisEdge,
} from './vis-data.adapter';
