---
name: x-arch-graph-pruner
description: 'Knowledge graph maintenance and pruning. Cleans up outdated or contradictory architecture memories to maintain a high-quality knowledge base.'
---

# Knowledge Graph Pruner

## Purpose

Maintain the freshness and accuracy of the `memory` knowledge graph; remove outdated, contradictory, or duplicated architectural records.

## Pruning Workflow

1. **Full Graph Read:** Invoke `read_graph` to load the current knowledge graph.
2. **Contradiction Detection:** Invoke `tool-thinking` to check:
   - Is there more than one Entity with the same concept?
   - Do Relations reference deleted or renamed entities?
   - Are knowledge entries contradicting the current `docs/architecture/00-LogicOverview.md`?
3. **Execute Pruning:** Use `delete_entities` or `delete_relations` to clean up invalid data.
4. **Re-Sync:** Re-read the latest architecture document and use `create_entities` to add missing knowledge.

## Pruning Standards

- **Conflict Resolution:** The version recorded after the last deployment date prevails.
- **Deduplication:** Keep only the most specific description; remove over-generalized summaries.
- **Freshness Validation:** Any Entity not verified for more than 30 days must be re-confirmed.
