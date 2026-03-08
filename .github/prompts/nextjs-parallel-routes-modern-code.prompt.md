---
name: nextjs-parallel-routes-modern-code
agent: 'agent'
tools: ['search', 'edit/editFiles']
description: 'Generate or refactor Next.js App Router code with parallel routes, intercepting routes, and server-first defaults.'
---

# Generate Next.js Parallel Routes (Modern Pattern)

Implement modern App Router patterns without breaking existing behavior.

## Requirements
- Use `@slot` routes for independent UI regions
- Use intercepting routes for overlays/modals when appropriate
- Keep Server Components by default
- Place `loading.tsx`/`error.tsx` intentionally for streaming UX
- Avoid placing infra calls in presentation-only components

## Output
- Proposed route tree
- Implementation patch plan
- Boundary/compliance notes
