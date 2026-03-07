/**
 * Module: _projector.ts
 * Purpose: Schedule timeline read model — resource-dimension projection.
 * Responsibilities: maintain pre-computed resource groups and overlap counts [L5-Bus]; apply version guard [S2]
 * Constraints: deterministic logic, respect module boundaries
 *
 * Per 00-LogicOverview.md:
 *   TL_PROJ (schedule-timeline-view) feeds QGWAY_TL.
 *   "資源維度 Read Model [L5-Bus]": schedule items grouped by resource (member/workspace).
 *   "overlap/resource-grouping 下沉 L5": overlap detection pre-computed at projection layer.
 *   "applyVersionGuard() [S2]": idempotent — skip if aggregateVersion ≤ lastProcessedVersion.
 */

import { versionGuardAllows } from '@/shared-kernel';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import { serverTimestamp, setDocument } from '@/shared/infra/firestore/firestore.write.adapter';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single schedule item stored in the resource-dimension read model. */
export interface ScheduleTimelineItem {
  id: string;
  title: string;
  /** Epoch milliseconds — allows simple numeric sorting without Firestore Timestamp. */
  startMs: number;
  endMs: number;
  status: string;
  workspaceId: string;
  workspaceName?: string;
  temporalKind?: string;
  /** Pre-computed: true when this item overlaps another item for the same resource. */
  hasOverlap: boolean;
}

/** All items belonging to a single resource (member or workspace), pre-grouped. */
export interface ScheduleTimelineResourceGroup {
  /** memberId or workspaceId — the grouping key. */
  resourceId: string;
  resourceName: string;
  items: ScheduleTimelineItem[];
  /** Pre-computed count of items that have at least one overlap within this group. */
  overlapCount: number;
}

/**
 * Top-level read model for QGWAY_TL.
 *
 * Stored at: scheduleTimelineView/{dimensionId}
 * Optionally scoped to a single workspace via workspaceId.
 */
export interface ScheduleTimelineViewRecord {
  /** Org/account identifier that defines the scheduling dimension. */
  dimensionId: string;
  /** Optional workspace scope; undefined means the full dimension view. */
  workspaceId?: string;
  resourceGroups: ScheduleTimelineResourceGroup[];
  totalItemCount: number;
  totalOverlapCount: number;
  readModelVersion: number;
  /** Last aggregate version processed by this projection [S2] */
  lastProcessedVersion?: number;
  /** TraceId from the originating EventEnvelope [R8] */
  traceId?: string;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// ─── Overlap helper ───────────────────────────────────────────────────────────

/** Returns true when two time intervals [aStart,aEnd) and [bStart,bEnd) overlap. */
function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Tags each item in a group with `hasOverlap` and returns the overlap count.
 * Uses a Set of overlapping indices determined first, then applies flags in a final pass.
 * O(n²) — acceptable for the small per-resource item counts typical of schedules.
 */
function computeOverlaps(items: ScheduleTimelineItem[]): number {
  const overlapIndices = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (intervalsOverlap(items[i].startMs, items[i].endMs, items[j].startMs, items[j].endMs)) {
        overlapIndices.add(i);
        overlapIndices.add(j);
      }
    }
  }

  // Apply flags in a single final pass — no mutation during the detection loop.
  for (const idx of overlapIndices) {
    items[idx] = { ...items[idx], hasOverlap: true };
  }

  return overlapIndices.size;
}

// ─── Projection write ─────────────────────────────────────────────────────────

/** Input shape for a resource group before overlap computation. */
interface RawResourceGroup {
  resourceId: string;
  resourceName: string;
  items: Omit<ScheduleTimelineItem, 'hasOverlap'>[];
}

/**
 * Writes (or overwrites) the schedule-timeline read model for a given dimension.
 *
 * Applies the version guard [S2]: skips write if aggregateVersion ≤ lastProcessedVersion.
 *
 * @param dimensionId  - org/account ID that owns this timeline view
 * @param rawGroups    - resource groups with items (hasOverlap not yet set)
 * @param aggregateVersion - version from the source event envelope
 * @param traceId      - optional trace ID for audit [R8]
 */
export async function projectScheduleTimelineView(
  dimensionId: string,
  rawGroups: RawResourceGroup[],
  aggregateVersion?: number,
  traceId?: string
): Promise<void> {
  const path = `scheduleTimelineView/${dimensionId}`;

  // [S2] version guard: skip stale replays
  if (aggregateVersion !== undefined) {
    const existing = await getDocument<ScheduleTimelineViewRecord>(path);
    if (!versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })) return;
  }

  // Pre-compute overlaps per group
  let totalItems = 0;
  let totalOverlaps = 0;

  const groups: ScheduleTimelineResourceGroup[] = rawGroups.map((g) => {
    const items: ScheduleTimelineItem[] = g.items.map((item) => ({ ...item, hasOverlap: false }));
    const groupOverlapCount = computeOverlaps(items);
    totalItems += items.length;
    totalOverlaps += groupOverlapCount;
    return { resourceId: g.resourceId, resourceName: g.resourceName, items, overlapCount: groupOverlapCount };
  });

  const record: ScheduleTimelineViewRecord = {
    dimensionId,
    resourceGroups: groups,
    totalItemCount: totalItems,
    totalOverlapCount: totalOverlaps,
    readModelVersion: 1,
    lastProcessedVersion: aggregateVersion,
    traceId,
    updatedAt: serverTimestamp(),
  };

  await setDocument(path, record);
}
