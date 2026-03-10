/**
 * Module: vis-network-canvas
 * Purpose: Provide a React wrapper around vis-network for graph visualization.
 * Responsibilities: mount/unmount Network instance against a div ref, own vis-data
 *   DataSet lifecycle for incremental updates, expose network instance via callback.
 * Constraints: deterministic logic, respect module boundaries; browser-only via useEffect.
 *   DataSet creation lives here (lib-ui) so feature slices never import vis-data directly [D24/D28].
 */
"use client"

import { useEffect, useRef } from "react"
import type { DataSet } from "vis-data"
import type { Edge, Network, Node, Options } from "vis-network"
import "vis-network/styles/vis-network.css"

export interface VisNetworkCanvasProps {
  nodes: Node[]
  edges: Edge[]
  options?: Options
  onReady?: (network: Network) => void
  className?: string
}

export function VisNetworkCanvas({
  nodes,
  edges,
  options,
  onReady,
  className,
}: VisNetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  const nodesDataSetRef = useRef<DataSet<Node> | null>(null)
  const edgesDataSetRef = useRef<DataSet<Edge> | null>(null)
  // Always-current mirrors of the props — prevent stale closure snapshots
  // in the async init() when props change before the import promise resolves.
  const nodesRef = useRef<Node[]>(nodes)
  const edgesRef = useRef<Edge[]>(edges)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  // Mount once — vis-network manages its own DOM imperatively.
  // DataSets are created here so consumers never import vis-data directly [D24/D28].
  useEffect(() => {
    if (!containerRef.current) return

    let network: Network | null = null
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      // Dynamic import prevents SSR evaluation of the browser-only packages
      const [{ Network: VisNetwork }, { DataSet }] = await Promise.all([
        import("vis-network"),
        import("vis-data"),
      ])

      // Read from refs (not the closure snapshot) so we always use the
      // latest prop values even if they changed during the async import.
      const nodesDs = new DataSet<Node>(nodesRef.current)
      const edgesDs = new DataSet<Edge>(edgesRef.current)
      nodesDataSetRef.current = nodesDs
      edgesDataSetRef.current = edgesDs

      network = new VisNetwork(
        containerRef.current!,
        { nodes: nodesDs, edges: edgesDs },
        options ?? {},
      )
      networkRef.current = network
      onReady?.(network)

      // ResizeObserver triggers redraw when the container is resized (e.g. sidebar collapse)
      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => networkRef.current?.redraw())
        resizeObserver.observe(containerRef.current)
      }
    }

    void init()

    return () => {
      resizeObserver?.disconnect()
      resizeObserver = null
      network?.destroy()
      networkRef.current = null
      nodesDataSetRef.current = null
      edgesDataSetRef.current = null
    }
    // Intentional empty array: vis-network manages state imperatively; prop changes
    // are pushed via DataSet upsert/remove effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Diff-based node update: upsert changed/new nodes, remove stale ones.
  // vis-network subscribes to DataSet mutations and re-renders only affected elements,
  // which is more efficient than a full setData() replacement.
  useEffect(() => {
    const ds = nodesDataSetRef.current
    if (!ds) return
    if (nodes.length === 0) {
      ds.clear()
      return
    }
    ds.update(nodes)
    const incomingIds = new Set<string | number>(
      nodes.flatMap(n => (n.id !== undefined ? [n.id] : [])),
    )
    const stale = ds.getIds().filter(id => !incomingIds.has(id))
    if (stale.length > 0) ds.remove(stale)
  }, [nodes])

  // Diff-based edge update — same pattern as the nodes effect above.
  useEffect(() => {
    const ds = edgesDataSetRef.current
    if (!ds) return
    if (edges.length === 0) {
      ds.clear()
      return
    }
    ds.update(edges)
    const incomingIds = new Set<string | number>(
      edges.flatMap(e => (e.id !== undefined ? [e.id as string | number] : [])),
    )
    const stale = ds.getIds().filter(id => !incomingIds.has(id))
    if (stale.length > 0) ds.remove(stale)
  }, [edges])

  useEffect(() => {
    if (!networkRef.current || !options) return
    networkRef.current.setOptions(options)
  }, [options])

  return <div ref={containerRef} className={className ?? "h-full min-h-64 w-full"} />
}
