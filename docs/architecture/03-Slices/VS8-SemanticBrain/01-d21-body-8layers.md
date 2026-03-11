# [索引 ID: @VS8-D21] VS8 Semantic Brain - D21 Body

## Four-Layer Architecture

1. Governance
2. Core Domain
3. Compute Engine
4. Output

## Core Invariants

- `D21-A`: 全域語義唯一註冊律
- `D21-B`: schema 鎖定
- `D21-C`: 無孤立節點
- `D21-E`: 權重透明化
- `D21-G`: 學習只接受事實事件驅動
- `D21-H/K`: BBB 與衝突裁決
- `D21-7`: 讀寫分離，讀走 tag-snapshot

## Output Contracts

- projection.tag-snapshot
- semantic-governance-view
- decision policy interfaces (including cost classifier)

## D21 與 SSOT Phase 對應

> 參考 SSOT：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`

以下將各 D21 不變量映射至 SSOT 執行 Phase，說明每項規則在協議中的對應節點。

| D21 不變量 | 說明 | SSOT Phase 對應 |
|-----------|------|----------------|
| **D21-A** 語義唯一性 | 全域語義唯一註冊律；新概念須先在 `skills` 集合以標準術語登記 | **Phase 0 建立**（Step 0.1 Admin→L8 寫入 slug）；**Phase 1 寫入驗證**（FI-002 事務寫入前校驗唯一性） |
| **D21-B** schema 鎖定 | 強型別標籤；schema 結構不可自行擴充 | **Phase 0.1**（Skill Ontology slug 定義時即鎖定 schema）；**Phase 0.2**（Tag Ontology 建構確認型別合約） |
| **D21-C** 無孤立節點 | 每個標籤須掛載 parent（`taxonomyPath` 層次路徑）；節點連通性不破壞 | **Phase 0.1/0.2 本體論初始化**（ontology bootstrap 必須確保每個節點有合法 parent） |
| **D21-E** 權重透明化 | 邊緣儲存；`weight` 啟用後不可變 | **L8 持久化層**（Phase 0–1 寫入時即建立不可變邊緣；Phase 2 Tool-V 讀取驗證） |
| **D21-G** 學習只接受事實事件驅動 | 語義權威；圖譜只接受事實驅動更新 | **Phase 0 VS8 Admin 角色**（Step 0.1：Admin→L8 由授權人員觸發，非系統自動推斷） |
| **D21-H/K** BBB 與衝突裁決 | 推理限制與審計；AI 推理邊界與衝突裁決規則 | **Phase 2 L10 決策**（L10 Genkit Orchestrator 嚴守工具調用順序 GT-2）；**L4A 稽核**（Step 2.12 五大欄位記錄每次推理決策） |
| **D21-7** 讀寫分離 | 標籤快照；讀走 tag-snapshot，不直讀圖譜 | **S4 freshness contract**（Phase 2 Tool-M 查詢 L8 時依賴 tag-snapshot 的新鮮度保障，非直讀 adjacency list） |
