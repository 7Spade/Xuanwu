# [索引 ID: @VS5-Doc] VS5 Workspace - Document Parser

## Scope

將原始文件解析為 `ParsingIntent`，提供後續任務與財務路由決策。

## Pipeline

1. `workspace.files` 提供原始資料
2. parser 產生 `ParsedLineItem[]`
3. 調用 VS8 `classifyCostItem()`
4. 形成 `ParsingIntent.lineItems[]`

## Implemented Capabilities (from code)

- UI 入口：`WorkspaceDocumentParser`（parser 視圖）。
- Intent 寫入：`saveParsingIntent`。
- 匯入流程狀態：`startParsingImport`、`finishParsingImport`、`markParsingIntentImported`、`markParsingIntentFailed`。
- 讀取訂閱：`subscribeToParsingIntents`。
- idempotency：`buildParsingImportIdempotencyKey`。

## Data Contracts

- `ParsedLineItem`
- `ParsingIntent`
- `ParsingImport`
- `ParsingIntentReviewStatus`
- `ParsingImportStatus`

## Contract

- `#A4`: ParsingIntent 僅提案，不可直接變更下游 aggregate。
- `#A14`: 每個 line item 必須有 `(costItemType, semanticTagSlug, sourceIntentIndex)`。
- `D27`: 任務物化只能由 gate 決定。

## Integration Boundary

- 與 tasks 的連動以 `sourceIntent` 對應查詢/導入流程處理，不直接跨域 mutate workflow/finance aggregate。
- 與 finance 的連動僅透過後續 gate 與投影鏈路，不在 parser 階段決策撥款狀態。

## Forbidden

- VS5 私建分類器。
- parser 階段直接做 async/DB side effects。

## Phase 對齊（SSOT Phase Alignment）

| Phase | 步驟 | VS5 Document Parser 角色 |
|-------|------|-------------------------|
| Phase 0 (Step 0.4) | 建立任務需求 (D3→L8) | Document Parser 解析出的 ParsingIntent → #A4 契約 → VS8 Cost Classifier → EXECUTABLE 判定後方可觸發 Phase 0.4 寫入 |
| Phase 1 (Step 1.3-1.4) | 執行領域命令 [D29] + Firestore 寫入 [FI-002] | 解析結果轉為 Task Command，透過 D29 TransactionalCommand + FI-002 單交易持久化 |
| Phase 1 (Step 1.5) | 請求語義提取 | Document Parser 輸出的任務需求觸發 L10 Genkit 提取 `requirementsEmbedding` |

**Tool-S 銜接（Phase 2 前置）**：  
Document Parser 完成後，任務的 `semanticTagSlugs` 必須透過 Tool-S（`search_skills`）正規化為 canonical slugs，
作為 Phase 2 向量匹配的語義基礎（對齊 GT-3 / OT-2）。
