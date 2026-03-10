# VS8-SemanticBrain

## 一眼摘要

- 用途：提供語義治理與標籤權威，輸出可供各切片消費的語義決策與索引能力。
- 核心功能：semantic governance/core/compute/output layers（`D21`）、tag authority + conflict guard（`D21-A` `D21-H` `D21-K`）、semantic router + cost classifier contracts（`D27`）。
- 解決痛點：
	1. 各切片各自解讀標籤語義，導致分類與決策結果不一致。
	2. 標籤關係缺乏衝突防護，容易形成語義循環或髒資料。
	3. 成本語義判斷分散在業務切片，造成決策漂移與不可審計。

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

## 文件索引

| 文件                    | 用途                                               |
|-------------------------|----------------------------------------------------|
| `README.md`             | VS8 願景摘要與實作能力清單（本文件）。             |
| `architecture.md`       | 目標架構：十層 `centralized-*` 結構、模組對應表、API 邊界。|
| `architecture-build.md` | 詳細實施計畫：逐階段目錄遷移步驟與驗證清單。       |
| `01-d21-body-8layers.md`| D21 四層核心不變量。                               |
| `02-semantic-router.md` | 語義路由規則。                                     |
| `03-tag-authority.md`   | 標籤權威規則。                                     |
