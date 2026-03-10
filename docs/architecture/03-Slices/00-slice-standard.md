# [索引 ID: @VS-STD] 00 - Slice Standard

本檔定義 VS1~VS9 文檔與實作的共同結構。

## 1. Slice 文檔必要結構（依層級責任與邊界界定）

每個 slice 文件應包含下列依層級責任與邊界界定的必要章節：

1. Scope
2. Write Path (L2/L3/L4)
3. Read Path (L5/L6)
4. Invariants 引用 (D/S/R/A/#)
5. Forbidden Paths

## 2. 層級責任

- L2: Command 收口與授權攔截
- L3: Domain 行為與 aggregate 狀態
- L4: 事件對外整合與 lane 分流
- L5: 投影物化與版本守衛
- L6: 讀取出口與查詢組裝

## 3. 單向鏈硬約束

- MUST: 寫鏈遵守 `L0 -> L2 -> L3 -> L4 -> L5`。
- MUST: 讀鏈遵守 `L0/UI -> L6 -> L5`。
- FORBIDDEN: 任意回跳、旁路、反向驅動。

## 4. Import 邊界

- MUST: 跨 slice 只能從 `@/features/{slice}/index` 引入 (`D7`)。
- FORBIDDEN: 引用他 slice 私有 `_*.ts`。
- FORBIDDEN: feature 直接 import `firebase/*` 或 `@/shared-infra/*` (`D24`)。

## 5. Outbox / Projection

- MUST: 寫側異動需產生事件並進 outbox (`S1`)。
- MUST: 投影更新需 `applyVersionGuard()` (`S2`)。
- MUST: Projection 可由事件重建 (`#9`)。

## 6. 語義與權威出口

- MUST: 語義讀取走 `projection.tag-snapshot` (`D21-7`, `T5`)。
- MUST: 搜尋走 `global-search.slice` (`#A12`)。
- MUST: 副作用走 `notification-hub.slice` (`#A13`)。

## 7. VS9 Finance 最小約束（新增）

- MUST: Finance staging 寫入只可由 L5 投影鏈路產生（`A20`）。
- MUST: Finance_Request 採獨立生命週期（`A21`）。
- MUST: 任務金融顯示狀態僅可經 `task-finance-label-view` 對外暴露（`A22`）。
- FORBIDDEN: VS9 直接寫回 VS5 任務 Aggregate 狀態。

## 8. Code-backed 回寫契約（Documentation Writeback Contract）

- MUST: 每個 slice `README.md` 都包含 `Implemented Capabilities (from code)`。
- MUST: capability 清單以 `src/features/{slice}/index.ts` 對外匯出為準，不可臆測內部能力。
- MUST: 文件中的 action/query/service/component 名稱需可在程式碼中被檢索。
- SHOULD: 若能力已遷移到其他 slice，需在原 slice 文件標註 migration note。
- FORBIDDEN: 僅保留抽象敘述而無可驗證能力名稱。

## 9. Next.js 邊界回寫規則

- MUST: 明確標註 server actions 邊界（通常來自 `_actions.ts`）。
- MUST: 明確標註 read queries 邊界（通常來自 `_queries.ts` / projection read models）。
- MUST: 明確標註 UI hooks/components 是 client-facing 能力，不可與 aggregate 規則混寫。
- FORBIDDEN: 將 `src/app` route 組裝責任誤寫為 slice domain 能力。
