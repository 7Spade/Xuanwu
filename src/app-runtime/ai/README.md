# src/app-runtime/ai — AI Runtime Layer

## Purpose

`src/app-runtime/ai` 是專案的 AI 執行期模組，負責：
- 建立 Genkit client
- 註冊可執行的 AI flows
- 定義 flows 的輸入輸出 schema（型別契約）

此目錄是執行期接線與推理流程載體，不承載一般 UI 或領域聚合邏輯。

## Current Structure

```
src/app-runtime/ai/
├── README.md
├── index.ts
├── genkit.ts
├── dev.ts
├── flows/
│   ├── adapt-ui-color-to-account-context.ts
│   └── extract-invoice-items.ts
└── schemas/
		└── docu-parse.ts
```

## Core Files

- `genkit.ts`
	- 建立 `ai` instance
	- 目前模型預設：`googleai/gemini-2.5-flash`
	- 目前 plugin：`@genkit-ai/google-genai`

- `dev.ts`
	- 開發期入口（server）
	- 載入並註冊 flows：
		- `adapt-ui-color-to-account-context`
		- `extract-invoice-items`

- `index.ts`
	- 目前對外匯出：
		- flow：`extractInvoiceItems`
		- flow：`adaptUIColorToAccountContext`（含 I/O 型別 `AdaptUIColorToAccountContextInput`、`AdaptUIColorToAccountContextOutput`）
		- schemas：`docu-parse.ts` 全部匯出

## Flows

- `extract-invoice-items.ts`
	- 功能：從報價單/發票抽取 `workItems`
	- 特性：
		- 每列包含 `semanticTagSlug`
		- 保證 `sourceIntentIndex`（缺值時以行序補齊）

- `adapt-ui-color-to-account-context.ts`
	- 功能：根據帳號語境生成 UI 色彩建議
	- 輸出：`primaryColor`、`backgroundColor`、`accentColor`

## Schemas

- `schemas/docu-parse.ts`
	- `ParsedWorkItemSchema`
	- `ExtractInvoiceItemsInputSchema`
	- `ExtractInvoiceItemsOutputSchema`
	- 另提供 `WorkItem` 型別別名

## Dependency Boundaries

- ✅ 允許：`ai/*` 依賴 `genkit`、`@genkit-ai/google-genai`、本目錄 schema/flow
- ✅ 允許：透過 alias 引用 `@/app-runtime/ai/*`
- ❌ 禁止：在 flow 內直接混入 UI 元件或 React client 邏輯
- ❌ 禁止：在此層加入與 AI 無關的領域流程

## Maintenance Notes

- 新增 flow 時：
	1. 在 `flows/` 新增檔案
	2. 在 `dev.ts` 匯入以完成註冊
	3. 視需求在 `index.ts` 增加對外匯出
	4. 同步更新本 README

- 調整 schema 時：
	- 優先修改 `schemas/*`，再對齊對應 flow 的 input/output 定義。
