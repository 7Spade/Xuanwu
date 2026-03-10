# VS8-SemanticBrain

- Semantic governance, core, compute, output layers (`D21`)
- Tag authority and conflict guard (`D21-A` `D21-H` `D21-K`)
- Semantic router and cost classifier contracts (`D27`)

## Implemented Capabilities (from code)

- Aggregate logic: temporal conflict detection + taxonomy validation。
- Mutation actions: tag upsert/assign/remove、semantic edge add/remove、tag lifecycle register/activate/transition。
- Query services: semantic index query/stats、eligible tags、relation edges、stale tag warnings。
- Neural/causality queries: semantic distance、isolated nodes、affected nodes、causality chain。
- Cost classification: `classifyCostItem*` + `shouldMaterializeAsTask`（parser Layer-2 判定）。
- CTA ops: centralized tag CRUD + lifecycle event publish。
- Governance guards: L5 invariant guard（BBB）與 L8 consensus engine。
- Embedding port: embedding adapter 注入與 batch embedding builder。
- Output projection helpers: tag snapshot presentation。
