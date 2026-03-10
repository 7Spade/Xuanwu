/**
 * Module: vis-network-canvas
 * Purpose: Provide a React wrapper around vis-network for graph visualization.
 * Responsibilities: mount/unmount Network instance against a div ref, own vis-data
 *   DataSet lifecycle for incremental updates OR accept pre-created DataSets from
 *   VisDataAdapter for the Firebase real-time subscription path [D28].
 * Constraints: deterministic logic, respect module boundaries; browser-only via useEffect.
 *   Internal DataSet creation (managed mode) keeps feature slices from importing
 *   vis-data directly [D24/D28].
 *
 * Two rendering modes:
 *   Managed mode — pass `nodes` + `edges` arrays; component creates and owns DataSets.
 *     Use for Firestore one-shot queries (e.g. semantic-dictionary panel).
 *   Adapter mode — pass `nodesDataSet` + `edgesDataSet` from VisDataAdapter [D28].
 *     Firebase snapshot subscription calls adapter.applyGraphSnapshot() → writes to
 *     those DataSets → vis-network re-renders reactively. No internal DataSets created.
 *     Use for real-time Firebase graph views (e.g. workspace-graph-view projection).
 */
"use client"

import { useEffect, useRef } from "react"
import type { Data, DataSet, Edge, Network, Node, Options } from "vis-network"
import "vis-network/styles/vis-network.css"

/**
 * Minimal DataSet interface structurally compatible with:
 *  - vis-data's DataSet<T>   (the actual runtime object)
 *  - VisDataAdapter's VisDataSet<T>  (the minimal interface in shared-infra)
 *
 * Used so VisNetworkCanvas can accept pre-created DataSets from VisDataAdapter
 * without importing vis-data or shared-infra types directly. [D24/D28]
 */
export interface VisCompatibleDataSet {
  add(data: unknown): unknown
  update(data: unknown): unknown
  remove(id: unknown): unknown
  clear(): void
}

export interface VisNetworkCanvasProps {
  /**
   * Managed mode: pass plain arrays; component creates and owns DataSets.
   * Use when data comes from a one-shot Firestore query (no real-time subscription).
   */
  nodes?: Node[]
  edges?: Edge[]
  /**
   * Adapter mode: pass pre-created DataSets from VisDataAdapter [D28].
   * Firebase subscription → adapter.applyGraphSnapshot() → DataSet write
   * → vis-network reacts automatically (reactive DataSet subscription).
   * When provided, `nodes`/`edges` array props are ignored.
   */
  nodesDataSet?: VisCompatibleDataSet
  edgesDataSet?: VisCompatibleDataSet
  options?: Options
  onReady?: (network: Network) => void
  className?: string
}

export function VisNetworkCanvas({
  nodes,
  edges,
  nodesDataSet,
  edgesDataSet,
  options,
  onReady,
  className,
}: VisNetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  // Used in managed mode only; null in adapter mode.
  const nodesInternalRef = useRef<DataSet<Node> | null>(null)
  const edgesInternalRef = useRef<DataSet<Edge> | null>(null)
  // Always-current mirrors for managed mode — prevent stale closure snapshots
  // in the async init() when props change before the import promise resolves.
  const nodesRef = useRef<Node[]>(nodes ?? [])
  const edgesRef = useRef<Edge[]>(edges ?? [])

  useEffect(() => {
    nodesRef.current = nodes ?? []
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges ?? []
  }, [edges])

  // Mount once — vis-network manages its own DOM imperatively.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current) return

    // Mode is fixed at mount time.
    const isAdapterMode =
      nodesDataSet !== undefined && edgesDataSet !== undefined

    let network: Network | null = null
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      let data: Data

      if (isAdapterMode) {
        // Adapter mode [D28]: DataSets are owned and written by VisDataAdapter.
        // Firebase snapshot → adapter.applyGraphSnapshot() → DataSet.clear()+add()
        // → vis-network detects DataSet mutation and re-renders automatically.
        // No vis-data import needed here; the DataSet objects are injected by the caller.
        data = {
          nodes: nodesDataSet as unknown as Data["nodes"],
          edges: edgesDataSet as unknown as Data["edges"],
        }
      } else {
        // Managed mode: dynamically import vis-data here so SSR never evaluates it.
        const { DataSet } = await import("vis-data")
        const nodesDs = new DataSet<Node>(nodesRef.current)
        const edgesDs = new DataSet<Edge>(edgesRef.current)
        nodesInternalRef.current = nodesDs
        edgesInternalRef.current = edgesDs
        data = { nodes: nodesDs, edges: edgesDs }
      }

      const { Network: VisNetwork } = await import("vis-network")
      network = new VisNetwork(containerRef.current!, data, options ?? {})
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
      nodesInternalRef.current = null
      edgesInternalRef.current = null
    }
  }, [])

  // Managed mode: diff-based node update.
  // nodesInternalRef is null in adapter mode (adapter.applyGraphSnapshot handles writes).
  // vis-network subscribes to DataSet mutations and re-renders only affected elements.
  useEffect(() => {
    const ds = nodesInternalRef.current
    if (!ds || nodes === undefined) return
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

  // Managed mode: diff-based edge update — same pattern as nodes above.
  useEffect(() => {
    const ds = edgesInternalRef.current
    if (!ds || edges === undefined) return
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
