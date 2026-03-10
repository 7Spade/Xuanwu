/**
 * Module: vis-timeline-canvas
 * Purpose: React wrapper around vis-timeline for timeline visualization.
 * Responsibilities: mount/unmount Timeline instance against a div ref, own vis-data
 *   DataSet lifecycle for incremental updates OR accept pre-created DataSets from
 *   VisDataAdapter for the Firebase real-time subscription path [D28].
 * Constraints: browser-only via useEffect; feature slices must not import vis-* directly [D24/D28].
 *
 * Two rendering modes:
 *   Managed mode  — pass `items` (+ optional `groups`) arrays; component creates and owns DataSets.
 *   Adapter mode  — pass `itemsDataSet` (+ optional `groupsDataSet`) from VisDataAdapter [D28].
 *     Firebase snapshot → adapter.applyGraphSnapshot() → DataSet writes →
 *     vis-timeline re-renders reactively (DataSet subscription).
 */
"use client"

import { useEffect, useRef } from "react"
import type {
  DataGroup,
  DataGroupCollectionType,
  DataItem,
  DataItemCollectionType,
  Timeline,
  TimelineItem,
  TimelineOptions,
} from "vis-timeline"
import "vis-timeline/styles/vis-timeline-graph2d.min.css"

import type { VisCompatibleDataSet } from "./vis-types"

export interface VisTimelineCanvasProps {
  /**
   * Managed mode: pass plain arrays; component creates and owns DataSets.
   * Use when data comes from a one-shot Firestore query.
   */
  items?: DataItem[]
  groups?: DataGroup[]
  /**
   * Adapter mode: pass pre-created DataSets from VisDataAdapter [D28].
   * Firebase subscription → applyGraphSnapshot() → DataSet writes →
   * vis-timeline re-renders reactively. When provided, `items`/`groups` are ignored.
   */
  itemsDataSet?: VisCompatibleDataSet<DataItem>
  groupsDataSet?: VisCompatibleDataSet<DataGroup>
  options?: TimelineOptions
  onReady?: (timeline: Timeline) => void
  className?: string
}

export function VisTimelineCanvas({
  items,
  groups,
  itemsDataSet,
  groupsDataSet,
  options,
  onReady,
  className,
}: VisTimelineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const isAdapterModeRef = useRef(false)
  // Always-current mirrors for managed mode — prevent stale closure snapshots.
  const itemsRef = useRef<DataItem[]>(items ?? [])
  const groupsRef = useRef<DataGroup[] | undefined>(groups)

  useEffect(() => {
    itemsRef.current = items ?? []
  }, [items])

  useEffect(() => {
    groupsRef.current = groups
  }, [groups])

  // Mount once — vis-timeline manages its own DOM imperatively.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current) return

    const adapterMode = itemsDataSet !== undefined
    isAdapterModeRef.current = adapterMode

    let timeline: Timeline | null = null
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      // Resolve data sources: adapter mode uses injected DataSets; managed mode creates them.
      // Both code paths use `as unknown as` casts: the underlying runtime objects are vis-data
      // DataSet<T> instances in both cases, structurally compatible with vis-timeline's
      // DataItemCollectionType/DataGroupCollectionType at runtime. The cast bridges the
      // compile-time gap between VisCompatibleDataSet<T> / DataSet<T> and vis-timeline's
      // named collection types. [D24/D28]

      const { Timeline: VisTimeline } = await import("vis-timeline/standalone")

      let resolvedItems: DataItemCollectionType
      let resolvedGroups: DataGroupCollectionType | undefined

      if (adapterMode) {
        resolvedItems = itemsDataSet as unknown as DataItemCollectionType
        resolvedGroups = groupsDataSet as unknown as DataGroupCollectionType | undefined
      } else {
        const { DataSet } = await import("vis-data")
        resolvedItems = new DataSet<DataItem>(itemsRef.current) as unknown as DataItemCollectionType
        resolvedGroups = groupsRef.current
          ? (new DataSet<DataGroup>(groupsRef.current) as unknown as DataGroupCollectionType)
          : undefined
      }

      if (resolvedGroups !== undefined) {
        timeline = new VisTimeline(
          containerRef.current!,
          resolvedItems,
          resolvedGroups,
          options ?? {},
        )
      } else {
        timeline = new VisTimeline(containerRef.current!, resolvedItems, options ?? {})
      }
      timelineRef.current = timeline
      onReady?.(timeline)

      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => timelineRef.current?.redraw())
        resizeObserver.observe(containerRef.current)
      }
    }

    void init()

    return () => {
      resizeObserver?.disconnect()
      resizeObserver = null
      timeline?.destroy()
      timelineRef.current = null
    }
  }, [])

  // Managed mode: push item changes imperatively (skipped in adapter mode).
  useEffect(() => {
    if (!timelineRef.current || isAdapterModeRef.current || items === undefined) return
    timelineRef.current.setItems(items)
  }, [items])

  // Managed mode: push group changes imperatively (skipped in adapter mode).
  useEffect(() => {
    if (!timelineRef.current || isAdapterModeRef.current || groups === undefined) return
    timelineRef.current.setGroups(groups)
  }, [groups])

  useEffect(() => {
    if (!timelineRef.current || !options) return
    timelineRef.current.setOptions(options)
  }, [options])

  return <div ref={containerRef} className={className ?? "h-64 w-full"} />
}

// Re-export vis-timeline item types needed by feature slices to avoid direct vis-timeline imports.
export type { DataGroup, DataItem, Timeline, TimelineItem, TimelineOptions }
