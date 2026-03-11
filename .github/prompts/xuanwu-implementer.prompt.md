---
name: xuanwu-implementer
description: 'Implement or refactor Xuanwu application code with framework-aware Next.js, React, TypeScript, and Genkit guidance.'
agent: 'xuanwu-implementer'
argument-hint: 'Describe the implementation task, e.g.: refactor parallel routes for dashboard | design a Genkit notification flow'
---

# Xuanwu Implementation Workflow

This prompt consolidates framework-specific coding prompts into one Xuanwu implementation command.

## Modes

1. **Next.js implementation** — App Router, server-first patterns, parallel routes, and modern React boundaries.
2. **Genkit flow design** — clear I/O contracts, observability, and architecture-safe Genkit flow structure.
3. **Targeted refactor** — focused code changes that follow Xuanwu naming, typing, and feature-slice rules.

## Guardrails

- Keep diffs minimal and architecture-safe.
- Prefer existing repository patterns over introducing new abstractions.
- Hand browser/runtime verification to `xuanwu-test-expert` when needed.

Task: ${input:task:Describe the implementation task}
