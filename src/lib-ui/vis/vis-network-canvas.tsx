/**
 * Module: vis-network-canvas
 * Purpose: Provide a React wrapper around vis-network for graph visualization.
 * Responsibilities: mount/unmount Network instance against a div ref, forward data
 *   and options props, expose the network instance via callback.
 * Constraints: deterministic logic, respect module boundaries; browser-only via useEffect
 */
"use client"

import { useEffect, useRef } from "react"
import type { Data, Network, Options } from "vis-network"

interface VisNetworkCanvasProps {
  data: Data
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

  useEffect(() => {
    if (!containerRef.current) return

    let network: Network | null = null

    async function init() {
      // Dynamic import prevents SSR evaluation of the browser-only package
      const { Network: VisNetwork } = await import("vis-network")
      network = new VisNetwork(containerRef.current!, data, options ?? {})
      networkRef.current = network
      onReady?.(network)
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
    if (!networkRef.current) return
    networkRef.current.setData(data)
  }, [data])

  useEffect(() => {
    if (!networkRef.current || !options) return
    networkRef.current.setOptions(options)
  }, [options])

  return <div ref={containerRef} className={className ?? "h-full w-full min-h-64"} />
}
