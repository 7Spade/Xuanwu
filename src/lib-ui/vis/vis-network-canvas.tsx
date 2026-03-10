/**
 * Module: vis-network-canvas
 * Purpose: React wrapper around vis-network for graph visualization.
 * Responsibilities: mount/unmount Network instance against a div ref, own vis-data
 *   DataSet lifecycle for incremental updates OR accept pre-created DataSets from
 *   VisDataAdapter for the Firebase real-time subscription path [D28].
 * Constraints: browser-only via useEffect; feature slices must not import vis-* directly [D24/D28].
 *
 * Two rendering modes:
 *   Managed mode  — pass `nodes` + `edges` arrays; component creates and owns DataSets.
 *     Use for Firestore one-shot queries (e.g. semantic-dictionary panel).
 *   Adapter mode  — pass `nodesDataSet` + `edgesDataSet` from VisDataAdapter [D28].
 *     Firebase snapshot → adapter.applyGraphSnapshot() → DataSet writes →
 *     vis-network re-renders reactively (DataSet subscription).
 *     Use for real-time Firebase graph views (e.g. workspace-graph-view projection).
 */
"use client"

import { useEffect, useRef } from "react"
import type { Data, Network, Options } from "vis-network"

import type { VisCompatibleDataSet } from "./vis-types"

export type { VisCompatibleDataSet } from "./vis-types"

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
  nodesDataSet?: VisCompatibleDataSet<Node>
  edgesDataSet?: VisCompatibleDataSet<Edge>
  options?: Options
  onReady?: (network: Network) => void
  className?: string
}

export function VisNetworkCanvas({
  data,
  options,
  onReady,
  className,
}: VisNetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  // Used in managed mode only; null in adapter mode.
  const nodesInternalRef = useRef<DataSet<Node> | null>(null)
  const edgesInternalRef = useRef<DataSet<Edge> | null>(null)
  const isAdapterModeRef = useRef(false)
  // Always-current mirrors for managed mode — prevent stale closure snapshots
  // in the async init() when props change before the import promise resolves.
  const nodesRef = useRef<Node[]>(nodes ?? [])
  const edgesRef = useRef<Edge[]>(edges ?? [])

  useEffect(() => {
    if (!containerRef.current) return

    // Mode is fixed at mount time; read from props directly (not stale ref needed here).
    const adapterMode = nodesDataSet !== undefined && edgesDataSet !== undefined
    isAdapterModeRef.current = adapterMode

    let network: Network | null = null

    async function init() {
      let data: Data

      if (adapterMode) {
        // Adapter mode [D28]: DataSets are owned and written by VisDataAdapter.
        // Firebase snapshot → adapter.applyGraphSnapshot() → DataSet.clear()+add()
        // → vis-network detects DataSet mutation and re-renders automatically.
        // VisCompatibleDataSet<T> is structurally compatible with vis-network's
        // DataInterface<T> at runtime (the underlying objects are vis-data DataSets
        // created via VisDataAdapterOptions factory injection). The double-cast bridges
        // the structural difference between the minimal local interface and vis-network's
        // full DataSet type — safe because the runtime object IS a vis-data DataSet.
        data = {
          nodes: nodesDataSet as unknown as Data["nodes"],
          edges: edgesDataSet as unknown as Data["edges"],
        }
      } else {
        // Managed mode: dynamically import vis-data so SSR never evaluates it.
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

      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => networkRef.current?.redraw())
        resizeObserver.observe(containerRef.current)
      }
    }

    void init()

    return () => {
      network?.destroy()
      networkRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update data imperatively when props change after mount
  useEffect(() => {
    const ds = nodesInternalRef.current
    if (!ds || nodes === undefined) return
    if (nodes.length === 0) {
      ds.clear()
      return
    }
    ds.update(nodes)
    const incomingIds = new Set<string | number>(
      nodes.filter(n => n.id !== undefined).map(n => n.id!),
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
      edges.filter(e => e.id !== undefined).map(e => e.id as string | number),
    )
    const stale = ds.getIds().filter(id => !incomingIds.has(id))
    if (stale.length > 0) ds.remove(stale)
  }, [edges])

  useEffect(() => {
    if (!networkRef.current || !options) return
    networkRef.current.setOptions(options)
  }, [options])

  return <div ref={containerRef} className={className ?? "h-full w-full min-h-64"} />
}
