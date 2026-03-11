# 06-DecisionLogic

本目錄承載決策邏輯文件。

- `01-cost-classifier.md` (`#A14`, `D27`)
- `02-finance-cycle.md` (`#A15`, `#A21`, `#A22`)

## SSOT Phase 對應關係（Phase Context）

> 依據 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` SSOT，本目錄各決策模組與協議 Phase 的對應如下：

### 成本分類器（Cost Classifier — `#A14`, `D27`）

| Phase | 職責說明 |
|-------|----------|
| **Phase 1**（Write Chain） | 任務寫入時，D27 物化任務閘（Materialized Task Gate）在 L3 → L5 投影鏈路中完成成本分類標記；`FI-002` 保證分類結果與任務狀態在同一事務內持久化 |
| **Phase 2**（Matching Prerequisite） | L10 Genkit 匹配流程依賴 D27 成本分類結果作為 Tool-M 候選篩選的前置條件；未完成成本分類的任務不得進入智慧匹配流程 |

### 金融週期（Finance Cycle — `#A15`, `#A21`, `#A22`）

| Phase | 職責說明 |
|-------|----------|
| **Phase 1**（Staging Pool Write） | Finance staging pool 寫入必須由 L5 投影鏈路產生（`A20`）；`Finance_Request` 採獨立生命週期（`A21`），在 Phase 1 寫入鏈完成後透過投影事件觸發 |
| **Phase 3**（Projection Read） | 任務金融顯示狀態僅可經 `task-finance-label-view` 對外暴露（`A22`）；所有金融狀態讀取必須透過 L6 Query Gateway（Phase 3 Read Chain），不可直接讀取 VS9 Aggregate |

> **不變量對齊**：`#A15 / #A21 / #A22` finance gate 規則於 Phase 1 寫入與 Phase 3 讀取時均不得被其他 Slice 繞過（參見 `04-Invariants/03-authority.md` 第 5 節）。
