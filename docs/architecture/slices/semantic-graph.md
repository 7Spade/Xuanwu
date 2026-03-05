# VS8 · Semantic Graph Slice (The Brain)

## Domain Responsibility

VS8 is **the single semantic intelligence layer** for the entire platform.
It owns:
- Tag authority (the only legitimate source of tag entities).
- Cost item semantic classification.
- Neural network routing (Dijkstra-based skill-to-person matching).
- Causality tracing (downstream event impact analysis).
- Learning engine (weight updates driven by real facts from VS2/VS3).

No other slice may re-implement any of these capabilities [D26, D27].

## Architecture: 4-Layer Semantic Neural Network (D21-1 → D21-10)

| Layer | ID | Name | Responsibility |
|-------|----|------|---------------|
| Layer 1 | VS8_CL | Classification Layer | Tag / concept definition authority |
| Layer 2 | VS8_SL | Synapse Layer | Semantic-edge-store; carries typed weights |
| Layer 3 | VS8_NG | Neural Computation | Dijkstra / BFS; distance matrix; isolated-node detection |
| Layer 4 | VS8_RL | Routing Output | Routing agents; ranked assignment candidates |

Additional invariants:
- **D21-9** Synaptic weight invariant — weights may only increase monotonically via the learning engine.
- **D21-10** Topology observability — graph structure changes emit `SemanticTopologyChanged`.

## Tag Entity Types (TE)

| TE | Tag Kind | Example |
|----|----------|---------|
| TE1 | `tag::skill` | `plumbing`, `electrical`, `project-management` |
| TE2 | `tag::skill-tier` | `novice`, `intermediate`, `expert` |
| TE3 | `tag::cost-type` | `EXECUTABLE`, `MANAGEMENT`, `RESOURCE`, … |
| TE4 | `tag::role` | `org-admin`, `member`, `partner` |
| TE5 | `tag::team` | A named team within an org |
| TE6 | `tag::partner` | A linked external organisation |

## Cost Semantic Classification [D27 #A14]

`classifyCostItem(name: string): CostItemType` lives in `_cost-classifier.ts`.
`CostItemType` values: `EXECUTABLE | MANAGEMENT | RESOURCE | FINANCIAL | PROFIT | ALLOWANCE`.
The Layer-3 router in VS5 filters to `EXECUTABLE` before creating tasks.
**No other slice may re-implement this logic.**

## Neural Network Implementation

| File | Purpose |
|------|---------|
| `centralized-neural-net/neural-network.ts` | NeuralNetwork class: Dijkstra, distance matrix, isolated-node detection |
| `centralized-causality/causality-tracer.ts` | CausalityTracer: `traceAffectedNodes`, `rankAffectedNodes`, `buildDownstreamEvents` |
| `_queries.ts` | Public query surface |
| `index.ts` | Public barrel |

## Learning Engine [D21-G]

`learning-engine.ts` updates synaptic weights based on real fact events only:
- `AccountCreated` (VS2)
- `SkillXpChanged` (VS3)

Manual weight modifications are **forbidden**. Weights are monotonically non-decreasing.

## Incoming Dependencies

| Source | What is consumed |
|--------|-----------------|
| VS2 Account | `AccountCreated` → learning-engine |
| VS3 Skill | `SkillXpChanged` → learning-engine |
| VS5 Workspace | `classifyCostItem()` call for document parsing |
| VS6 Scheduling | `rankAffectedNodes()` call for assignment routing |

## Outgoing Dependencies

| Target | What is produced |
|--------|-----------------|
| IER | `TagLifecycleEvent`, `SemanticTopologyChanged` |
| global-search.slice | Tag-index updates via `TagLifecycleEvent` |
| Projection Bus [L5] | `tag-snapshot` read model |

## Events Emitted

| Event | DLQ Level | Description |
|-------|-----------|-------------|
| `TagLifecycleEvent` | SAFE_AUTO | Tag state transition (Draft→Active→Stale→Deprecated). |
| `SemanticTopologyChanged` | SAFE_AUTO | Graph topology changed; consumers may invalidate caches. |
| `NeuralWeightUpdated` | SAFE_AUTO | Learning engine updated a synaptic weight. |

## Key Invariants

- **[D21-9]** Weights are monotonically non-decreasing; only `learning-engine.ts` may write them.
- **[D21-10]** All topology mutations must emit `SemanticTopologyChanged`.
- **[D27]** `classifyCostItem()` is the authoritative cost classifier; no slice may re-implement.
- **[#A12]** global-search must index through VS8 tag entities.
- **[D26]** Other slices must call VS8 APIs; they must not contain semantic logic.
