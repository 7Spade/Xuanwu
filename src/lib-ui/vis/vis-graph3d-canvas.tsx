/**
 * Module: vis-graph3d-canvas
 * Purpose: React wrapper around vis-graph3d for 3-D surface/scatter graphs.
 * Responsibilities: mount/unmount Graph3d instance against a div ref, forward data
 *   and options, expose the graph instance via callback.
 * Constraints: browser-only via useEffect; feature slices must not import vis-* directly [D24/D28].
 *
 * NOTE: vis-graph3d ships `Graph3d` typed as `any` in its declarations (no named Data/Options
 * types), so permissive local aliases are used. Consumers can cast to their specific shape.
 */
"use client"

import { useEffect, useRef } from "react"

// vis-graph3d does not export named data/options types; permissive aliases are intentional.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Graph3dOptions = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Graph3dData = any

export interface VisGraph3dCanvasProps {
  data: Graph3dData
  options?: Graph3dOptions
  onReady?: (graph: unknown) => void
  className?: string
}

export function VisGraph3dCanvas({
  data,
  options,
  onReady,
  className,
}: VisGraph3dCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<unknown>(null)

  // Mount once — vis-graph3d manages its own DOM imperatively.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current) return

    let graph: { destroy?: () => void; redraw?: () => void } | null = null
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      // Dynamic import prevents SSR evaluation of the browser-only package.
      const { Graph3d } = await import("vis-graph3d")
      graph = new Graph3d(containerRef.current, data, options ?? {})
      graphRef.current = graph
      onReady?.(graph)

      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          const g = graphRef.current as { redraw?: () => void } | null
          g?.redraw?.()
        })
        resizeObserver.observe(containerRef.current)
      }
    }

    void init()

    return () => {
      resizeObserver?.disconnect()
      resizeObserver = null
      graph?.destroy?.()
      graphRef.current = null
    }
  }, [])

  return <div ref={containerRef} className={className ?? "h-96 w-full"} />
}
