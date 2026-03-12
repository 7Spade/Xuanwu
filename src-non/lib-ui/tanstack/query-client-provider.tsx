/**
 * Module: query-client-provider
 * Purpose: Provide a project-standard TanStack Query client with default configuration.
 * Responsibilities: create and expose a QueryClient instance with sensible retry/stale
 *   defaults; wrap children in QueryClientProvider for the app provider tree.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

interface TanstackQueryProviderProps {
  children: ReactNode
  /** Override default stale time in ms. Default: 60 000 (1 min) */
  staleTime?: number
  /** Override default retry count. Default: 1 */
  retry?: number
}

export function TanstackQueryProvider({
  children,
  staleTime = 60_000,
  retry = 1,
}: TanstackQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime,
            retry,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
