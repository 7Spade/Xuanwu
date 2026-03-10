/**
 * Module: vis-timeline-canvas
 * Purpose: Provide a React wrapper around vis-timeline for timeline visualization.
 * Responsibilities: mount/unmount Timeline instance against a div ref, forward items,
 *   groups and options, expose the timeline instance via callback.
 * Constraints: deterministic logic, respect module boundaries; browser-only via useEffect
 */
"use client"

import { useEffect, useRef } from "react"
import type { DataGroup, DataItem, Timeline, TimelineItem, TimelineOptions } from "vis-timeline"
import "vis-timeline/styles/vis-timeline-graph2d.min.css"

export interface VisTimelineCanvasProps {
  items: DataItem[]
  groups?: DataGroup[]
  options?: TimelineOptions
  onReady?: (timeline: Timeline) => void
  className?: string
}

export function VisTimelineCanvas({
  items,
  groups,
  options,
  onReady,
  className,
}: VisTimelineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<Timeline | null>(null)
  // Stale-closure prevention: always-current mirrors used inside the async init().
  const itemsRef = useRef<DataItem[]>(items)
  const groupsRef = useRef<DataGroup[] | undefined>(groups)
  const optionsRef = useRef<TimelineOptions | undefined>(options)

  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => { groupsRef.current = groups }, [groups])
  useEffect(() => { optionsRef.current = options }, [options])

  // Mount once — vis-timeline manages its own DOM imperatively.
  useEffect(() => {
    if (!containerRef.current) return

    let timeline: Timeline | null = null
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      // Dynamic imports prevent SSR evaluation of the browser-only packages.
      const { Timeline: VisTimeline } = await import("vis-timeline/standalone")
      const { DataSet } = await import("vis-data")
      const itemsDs = new DataSet<DataItem>(itemsRef.current)
      const groupsDs = groupsRef.current
        ? new DataSet<DataGroup>(groupsRef.current)
        : undefined
      if (groupsDs) {
        timeline = new VisTimeline(containerRef.current!, itemsDs, groupsDs, optionsRef.current ?? {})
      } else {
        timeline = new VisTimeline(containerRef.current!, itemsDs, optionsRef.current ?? {})
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
  // Intentional empty array: vis-timeline manages state imperatively; prop changes
  // are pushed via the setItems/setGroups/setOptions effects below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push item changes imperatively to avoid full re-mount on every render.
  useEffect(() => {
    if (!timelineRef.current) return
    timelineRef.current.setItems(items)
  }, [items])

  // Push group changes imperatively; clear groups when undefined (mode switch).
  useEffect(() => {
    if (!timelineRef.current) return
    if (groups) {
      timelineRef.current.setGroups(groups)
    } else {
      timelineRef.current.setGroups([])
    }
  }, [groups])

  // Push option changes imperatively.
  // Strip start/end to prevent unwanted viewport snap-back after the user has
  // panned or zoomed — those values are only meaningful on initial mount.
  useEffect(() => {
    if (!timelineRef.current || !options) return
    const { start: _start, end: _end, ...liveOptions } = options as TimelineOptions & { start?: Date | number | string; end?: Date | number | string }
    timelineRef.current.setOptions(liveOptions)
  }, [options])

  return <div ref={containerRef} className={className ?? "h-64 w-full"} />
}

// Re-export vis-timeline types so feature slices import from @/lib-ui/vis, not
// vis-timeline directly. This enforces the D24/D28 module boundary rule.
export type { DataItem, DataGroup, Timeline, TimelineItem, TimelineOptions }
