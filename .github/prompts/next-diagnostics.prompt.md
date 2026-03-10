---
name: next-diagnostics
description: 'Next.js App Router diagnostics: runtime errors, RSC boundaries, parallel route slots, streaming/suspense behavior, and route rendering issues. Uses next-devtools MCP for live server data.'
agent: 'agent'
tools: ['search/codebase', 'next-devtools/*']
argument-hint: 'Route or component path to diagnose, e.g.: app/(dashboard)/reports or leave blank for full scan'
---

# Next.js Route Diagnostics — Runtime · RSC Boundaries · Parallel Routes · Streaming

Use next-devtools MCP to inspect live server behavior alongside static codebase analysis.

## Diagnostic Scope

1. **Route map and build/runtime errors** — detect compilation failures and missing route files
2. **RSC vs Client boundary correctness** — verify `'use client'` placement at leaf nodes only
3. **Parallel route slot wiring** — check `@slot` directories and `default.tsx` fallbacks
4. **Suspense/streaming behavior** — validate `loading.tsx` and `Suspense` boundary placement
5. **Dynamic route async API usage** — confirm `params`/`searchParams` are awaited correctly
6. **Server component data patterns** — flag infra calls in presentation-only components

## Diagnostic Checks

- [ ] Incorrect `'use client'` placement (in layout, page, or non-leaf)
- [ ] Missing or miswired parallel route slot files (`@slot/default.tsx` absent)
- [ ] Suspense boundary missing or at wrong level
- [ ] `params`/`searchParams`/`cookies()`/`headers()` not awaited in async context
- [ ] Infra calls (DB, fetch) in Client Components
- [ ] Missing `loading.tsx` or `error.tsx` at meaningful boundaries

## Workflow

1. Use next-devtools to retrieve route graph and active diagnostics.
2. Cross-reference runtime findings with static codebase search.
3. For each issue: identify type, file location, root cause, and minimal safe fix.

## Output

```
Issue: <type>
File: <path:line>
Root cause: <description>
Fix: <minimal actionable change>
```

Route/component: ${input:target:Enter route path or leave blank for full scan}
