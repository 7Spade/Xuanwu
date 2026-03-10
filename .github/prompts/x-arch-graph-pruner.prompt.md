---
name: x-arch-graph-pruner
description: 'Knowledge graph maintenance and pruning. Cleans up outdated or contradictory architecture memories to maintain a high-quality knowledge base.'
agent: 'agent'
tools: ['memory/*', 'sequentialthinking/*']
---

# Knowledge Graph Pruner

Use [`x-arch-docs`](./x-arch-docs.prompt.md) as the canonical architecture-documentation workflow and execute **Mode C — Knowledge Graph Pruning**.

## This command's scope

- Clean outdated, contradictory, or duplicated architecture records from `memory`.
- Re-sync missing facts from current architecture SSOT after pruning.

## Pruning standards

- Conflict resolution: prefer the most recently verified version.
- Deduplication: keep the most specific entry; remove generalized duplicates.
- Freshness: unverified entities should be explicitly re-validated.
