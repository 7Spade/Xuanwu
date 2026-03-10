/**
 * Module: vis-timeline-canvas
 * Purpose: Provide a React wrapper around vis-timeline for timeline visualization.
 * Responsibilities: mount/unmount Timeline instance against a div ref, forward items,
 *   groups and options, expose the timeline instance via callback.
 * Constraints: deterministic logic, respect module boundaries; browser-only via useEffect
 */
"use client"

import { useEffect, useRef } from "react"
import type { DataGroup, DataItem, Timeline, TimelineOptions } from "vis-timeline"

interface VisTimelineCanvasProps {
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

  // Mount once — vis-timeline manages its own DOM imperatively
  useEffect(() => {
    if (!containerRef.current) return

    let timeline: Timeline | null = null

    async function init() {
      // Dynamic import prevents SSR evaluation of the browser-only package
      const { Timeline: VisTimeline } = await import("vis-timeline/standalone")
      const { DataSet } = await import("vis-data")
      const itemsDs = new DataSet<DataItem>(items)
      const groupsDs = groups ? new DataSet<DataGroup>(groups) : undefined
      if (groupsDs) {
        timeline = new VisTimeline(containerRef.current!, itemsDs, groupsDs, options ?? {})
      } else {
        timeline = new VisTimeline(containerRef.current!, itemsDs, options ?? {})
      }
      timelineRef.current = timeline
      onReady?.(timeline)
    }

    void init()

    return () => {
      timeline?.destroy()
      timelineRef.current = null
    }
  // Intentional empty array: vis-timeline manages state imperatively; prop changes
  // are pushed via the setItems/setGroups/setOptions effects below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push item changes imperatively to avoid full re-mount on every render
  useEffect(() => {
    if (!timelineRef.current) return
    timelineRef.current.setItems(items)
  }, [items])

  useEffect(() => {
    if (!timelineRef.current || !groups) return
    timelineRef.current.setGroups(groups)
  }, [groups])

  useEffect(() => {
    if (!timelineRef.current || !options) return
    timelineRef.current.setOptions(options)
  }, [options])

  return <div ref={containerRef} className={className ?? "h-64 w-full"} />
}
