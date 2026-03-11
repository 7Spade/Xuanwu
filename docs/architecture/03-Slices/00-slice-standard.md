# [索引 ID: @VS-STD] 00 - Slice Standard

本檔定義 VS1~VS9 文檔與實作的共同結構，並規範 auxiliary slices 的回寫方式。

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

### 8.2 Auxiliary Slices 回寫規則

- MUST: `global-search.slice` 文件標註其為跨域搜尋唯一權威出口（D26）。
- MUST: `portal.slice` 文件標註其為 portal shell state bridge，不承載跨切片寫入協調。
- MUST: 若 auxiliary slice 新增 public API，需同步更新對應架構文檔與審查清單。

### 8.1 Repomix 參考流程（建議）

1. 先讀 `.github/skills/xuanwu-skill/SKILL.md` 與 `.github/skills/xuanwu-skill/references/summary.md`。
2. 在 `.github/skills/xuanwu-skill/references/project-structure.md` 定位切片與候選檔案。
3. 在 `.github/skills/xuanwu-skill/references/files.md` 以 `## File: <path>` 檢索實際匯出/函式名。
4. 回寫 `Implemented Capabilities (from code)`，並與 `src/features/{slice}/index.ts` 再次交叉檢查。

## Phase 對齊要求（Phase Alignment Requirements）

> 依據 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` SSOT，每份 Slice 文件必須聲明其參與的 Phase，
> 並在對應的 Path 章節標示適用的機制規則。

### 基本宣告

每個 Slice 文件的 `Scope` 章節必須包含：

```
## Phase 參與
- Phase 0：[是 / 否] — 核心啟動（types / ontology / profile / task setup）
- Phase 1：[是 / 否] — 寫入鏈（D29 / FI-002 / LANE）
- Phase 2：[是 / 否，若為 VS8 相關] — 智慧匹配（Tool-S/M/V / E8 / GT-2 / L4A）
- Phase 3：[是 / 否] — 讀取鏈（L6 / S2）
```

### Phase 1 Write Path 要求

凡參與 Phase 1 的 Slice，其 `Write Path` 章節必須明確引用：

- **D29** `TransactionalCommand`：命令進入 L2 時必須標記
- **FI-002** 單一交易：L3 → L8 寫入必須在單一 Firestore 事務內完成
- **LANE 分流**：L4 整合事件必須標示 `CRITICAL` 或 `STANDARD` 路由分類

### Phase 2 Matching Path 要求（VS8 相關 Slice）

凡參與 Phase 2 的 Slice（主要為 `VS8-SemanticBrain` 及 `L4A`），其 `Matching Path` 章節必須明確引用：

- **Tool-S / Tool-M / Tool-V** 呼叫順序（L10 Genkit 流程序列）
- **E8 fail-closed**：Tool-M 必須攜帶 `tenantId`，否則中止
- **GT-2 fail-closed**：Tool-V 資格過濾，未通過即排除，禁止降級輸出
- **L4A 稽核欄位**：Who / Why / Evidence（含 inferenceTrace）/ Version / Tenant
- **L0B** 串流橋接：推理軌跡回傳 UI（Steps 2.8-2.9），不持久化狀態

### Phase 3 Read Path 要求

凡參與 Phase 3 的 Slice，其 `Read Path` 章節必須明確引用：

- **L6 Query Gateway**：所有讀取請求必須透過 `L0A → L6 → L5`，不可直接讀 L3 Aggregate
- **S2 Version Guard**：投影更新必須呼叫 `applyVersionGuard()` 確保單調遞增

### L0B 與 L4A 補充說明

- **L0B**（Server Action 串流橋接）：Phase 2 Steps 2.8-2.9 參與者；不持久化任何狀態；相關 Slice 文件應標註其作為推理軌跡橋接角色。
- **L4A**（語義決策稽核切片）：Phase 2 Step 2.12 參與者；擁有稽核日誌持久化的唯一權限；任何 Slice 均不可繞過 L4A 直接寫入稽核記錄。

## 9. Next.js 邊界回寫規則

- MUST: 明確標註 server actions 邊界（通常來自 `_actions.ts`）。
- MUST: 明確標註 read queries 邊界（通常來自 `_queries.ts` / projection read models）。
- MUST: 明確標註 UI hooks/components 是 client-facing 能力，不可與 aggregate 規則混寫。
- FORBIDDEN: 將 `src/app` route 組裝責任誤寫為 slice domain 能力。
