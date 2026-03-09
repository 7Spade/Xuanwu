/**
 * Module: vis-graph3d-canvas
 * Purpose: Provide a React wrapper around vis-graph3d for 3-D surface/scatter graphs.
 * Responsibilities: mount/unmount Graph3d instance against a div ref, forward data
 *   and options, expose the graph instance via callback.
 * Constraints: deterministic logic, respect module boundaries; browser-only via useEffect
 *
 * NOTE: vis-graph3d ships `Graph3d` typed as `any` in its declarations (no named Data/Options
 * types), so we use a permissive local alias. Consumers can cast to their specific data shape.
 */
"use client"

import { useEffect, useRef } from "react"

// vis-graph3d does not export named data/options types; permissive aliases are intentional.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Graph3dOptions = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Graph3dData = any

interface VisGraph3dCanvasProps {
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

  useEffect(() => {
    if (!containerRef.current) return

    let graph: { destroy?: () => void } | null = null

    async function init() {
      // Dynamic import prevents SSR evaluation of the browser-only package
      const { Graph3d } = await import("vis-graph3d")
      graph = new Graph3d(containerRef.current, data, options ?? {})
      graphRef.current = graph
      onReady?.(graph)
    }

    void init()

    return () => {
      graph?.destroy?.()
      graphRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className={className ?? "h-96 w-full"} />
}
