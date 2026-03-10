---
name: route-audit-diagnostics
description: 'Audit Next.js App Router rendering issues: RSC boundaries, parallel slots, and streaming/suspense behavior.'
agent: 'agent'
tools: ['search/codebase', 'next-devtools/*']
---

# Next.js Route Audit & Diagnostics

This command is a route-focused alias of [`next-diagnostics`](./next-diagnostics.prompt.md).
Reuse that canonical diagnostic flow, then prioritize route-slot and rendering-path findings.

## Checks
- Incorrect `'use client'` placement
- Missing or miswired parallel route slot files
- Suspense boundary placement issues
- Dynamic route async API misuse

## Output
- Issue type + file location
- Root cause
- Minimal safe fix
