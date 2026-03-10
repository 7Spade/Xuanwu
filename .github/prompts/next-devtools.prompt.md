---
name: tool-next-devtools
description: 'Use next-devtools MCP for Next.js runtime diagnostics: routes, RSC boundaries, and rendering behavior.'
tools: ['next-devtools/*']
agent: 'agent'
---

# Next.js Route Diagnostics

This command is the focused runtime alias of [`next-diagnostics`](./next-diagnostics.prompt.md).
Use the canonical checklist there, then keep this command's scope on next-devtools runtime signals.

## Focus
1. Route map and build/runtime errors
2. RSC vs Client boundary correctness
3. Parallel route slot rendering
4. Suspense/streaming behavior

## Output
- Diagnosed issue list
- Root cause per issue
- Minimal fix steps
