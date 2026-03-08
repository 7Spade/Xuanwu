---
description: "Performance optimization rules for frontend, backend, and data layers."
applyTo: "**/*"
---

# Performance Optimization Rules

Apply these rules to frontend, backend, and data-layer work.

## Core Principles

- MUST measure before optimizing.
- MUST prioritize bottlenecks on hot paths.
- SHOULD prefer simple, maintainable optimizations over complex micro-tuning.
- SHOULD define performance budgets (latency, memory, bundle size, query time).

## Frontend Rules

- MUST minimize unnecessary re-renders and avoid unstable list keys.
- MUST lazy-load non-critical assets and code.
- SHOULD optimize images/fonts and serve static assets with caching/CDN.
- SHOULD keep main-thread work small; debounce/throttle high-frequency handlers.
- MUST monitor Core Web Vitals and fix regressions.

## Backend Rules

- MUST avoid blocking I/O in request paths.
- MUST use efficient algorithms and data structures; eliminate avoidable `O(n^2)` work.
- SHOULD batch calls, stream large payloads, and paginate large result sets.
- SHOULD apply caching with explicit invalidation strategy.
- MUST use connection pooling and backpressure where applicable.

## Database Rules

- MUST index frequently filtered/joined columns.
- MUST avoid `SELECT *` in production query paths.
- MUST prevent N+1 patterns via joins/batching.
- SHOULD inspect query plans (`EXPLAIN`) for slow queries.
- SHOULD keep transactions short and isolate at the lowest safe level.

## Reliability and Monitoring Rules

- MUST collect latency, throughput, error rate, and resource metrics.
- MUST alert on performance regressions in critical paths.
- SHOULD use structured logs and minimize logging volume in hot paths.

## Review Checklist

- Are heavy operations measured and justified?
- Are large payloads paginated/streamed/chunked?
- Are queries indexed and free of N+1 issues?
- Are caches correct and invalidation safe?
- Are blocking operations removed from hot paths?
- Are regressions covered by tests/benchmarks/alerts?