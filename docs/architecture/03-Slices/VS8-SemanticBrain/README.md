# VS8-SemanticBrain

## 一眼摘要

- 用途：提供語義治理與標籤權威，輸出可供各切片消費的語義決策與索引能力。
- 核心功能：Tag 生命週期治理、時序衝突偵測、語義索引、成本分類器、Tag 事件匯流排。
- 解決痛點：
  1. 各切片各自解讀標籤語義，導致分類與決策結果不一致。
  2. 成本語義判斷分散在業務切片，造成決策漂移與不可審計。
  3. 缺乏跨切片統一的 Tag 事件訂閱機制。

## Implemented Capabilities（from code）

- Aggregate 邏輯：時序衝突偵測 + 分類法驗證。
- 命令 actions：Tag upsert/assign/remove。
- Tag 事件匯流排：`onTagEvent` / `publishTagEvent` [T1]。
- 查詢服務：語義索引查詢/統計。
- 成本分類器：`classifyCostItem*` + `shouldMaterializeAsTask`（parser Layer-2 判定）。
- Tag 快照展示：`getTagSnapshotPresentationMap`。

## 文件索引

| 文件                     | 用途                                                               |
|--------------------------|--------------------------------------------------------------------|
| `README.md`              | VS8 願景摘要與實作能力清單（本文件）。                              |
| `architecture.md`        | 現行架構：目錄結構、模組責任、API 邊界、架構不變量。               |
| `architecture-diagrams.md`| 架構圖：流程圖、層位圖、依賴圖（Mermaid）。                       |
| `architecture-build.md`  | 詳細實施計畫：下一階段目錄遷移步驟與驗證清單。                      |
| `01-d21-body-8layers.md` | D21 四層核心不變量。                                                |
| `02-semantic-router.md`  | 語義路由規則。                                                      |
| `03-tag-authority.md`    | 標籤權威規則。                                                      |
