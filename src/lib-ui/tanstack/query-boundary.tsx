/**
 * Module: query-boundary
 * Purpose: Wrap async query consumers with standardized loading and error surfaces.
 * Responsibilities: combine React Suspense with an error fallback to produce a
 *   drop-in async boundary for TanStack Query-powered subtrees.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { Suspense, type ReactNode, Component, type ErrorInfo } from "react"

interface QueryBoundaryProps {
  children: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

class InternalErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMessage: "" }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    // NOTE: Forward to telemetry in production (e.g., Sentry, GCP Error Reporting).
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== "production") console.error("[QueryBoundary]", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center rounded-2xl p-6 ring-1 ring-destructive/40 text-sm text-destructive">
            {this.state.errorMessage || "Something went wrong."}
          </div>
        )
      )
    }
    return this.props.children
  }
}

const DefaultLoadingFallback = (
  <div className="flex items-center justify-center rounded-2xl p-6 ring-1 ring-zinc-300/50 dark:ring-white/10 text-sm text-muted-foreground animate-pulse">
    Loading…
  </div>
)

export function QueryBoundary({ children, loadingFallback, errorFallback }: QueryBoundaryProps) {
  return (
    <InternalErrorBoundary fallback={errorFallback ?? null}>
      <Suspense fallback={loadingFallback ?? DefaultLoadingFallback}>{children}</Suspense>
    </InternalErrorBoundary>
  )
}
