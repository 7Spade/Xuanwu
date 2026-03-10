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
