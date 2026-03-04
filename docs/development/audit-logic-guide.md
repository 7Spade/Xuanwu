# 📖 Audit Logic & Observability 開發指南 v1

## 📌 定位與職責

在系統架構中，**Audit (審計日誌)** 不作為獨立的垂直切片 (Vertical Slice)，而是作為 **「全域橫切面觀察者 (Cross-cutting Observer)」**。

* **無副作用消費：** Audit 僅訂閱 `IER` 的 `BACKGROUND_LANE`。
* **不佔用 VS 編號：** 歸類於 `L9 Observability`。
* **追蹤權威：** 必須完整繼承 `event-envelope` 中的 `traceId` 與 `causationId`。

---

## 🏗️ 核心架構流程

### 1. 事件收集 (L4 Integration Event Router)

所有來自各切片（VS1~VS8）的事件透過 `outbox-relay` 投遞至 `IER`。

* **訂閱位置：** `IER_LANES.BG_LANE`。
* **過濾機制：** `audit-event-collector` 僅過濾標註有「具審計價值」的事件類型。

### 2. 資料投影 (L5 Projection Bus)

使用 `event-funnel` 將過濾後的事件轉化為讀取模型。

* **寫入守衛：** 必須遵守 `SK_VERSION_GUARD [S2]`，確保投影順序正確。
* **存儲路徑：**
* **組織級：** `projection.global-audit-view` (分區鍵: `orgId`)。
* **工作區級：** `projection.workspace-audit-view` (分區鍵: `workspaceId`)。



### 3. 統一讀取 (L6 Query Gateway)

前端透過 `QGWAY` 進行非同步讀取。

* **一致性：** 採用 `EVENTUAL_READ [S3]`。
* **SLA：** 遵守 `PROJ_STALE_STANDARD (≤ 10s) [S4]`。

---

## 📋 Audit Entry 資料契約

所有寫入 `audit-view` 的記錄必須包含以下結構：

| 欄位 | 來源 | 說明 | 規範 |
| --- | --- | --- | --- |
| `traceId` | `envelope.traceId` | 全鏈路唯一追蹤碼，禁止覆蓋 | **[R8]** |
| `actorId` | `ACTIVE_CTX` | 執行該操作的使用者 ID | **[#A9]** |
| `orgId` | `event.payload` | 所屬組織 ID | **[#10]** |
| `workspaceId` | `event.payload` | 所屬工作區 ID (可選) | **[#10]** |
| `category` | `VS8 Tags` | 操作類別（例如：`role`, `wallet`, `schedule`） | **[D21]** |
| `aggVersion` | `event.version` | 用於 `SK_VERSION_GUARD` 校驗 | **[S2]** |

---

## 🛠️ 開發守則 (Hard Invariants)

* **禁止主動寫入 [D1]：** 業務 Slice (`_actions.ts`) 禁止直接呼叫 Firestore 寫入審計表。審計必須由 `IER` 觸發。
* **禁止跨切片依賴 [D7]：** Audit 讀取模型僅透過 `Query Gateway` 暴露，禁止其他 Slice 的 Aggregate 引用 Audit 資料。
* **標籤感知 [D21]：** 審計日誌中的操作描述應盡量引用 `VS8 Semantic Graph` 的標籤語義。
* **追蹤唯一性 [D10]：** 禁止在 Audit 投影過程中產生新的 `traceId`，必須沿用入口注入的 ID。

---

## 🔍 查詢場景實作

### 組織管理員視角 (Global Audit)

> **需求：** 顯示該組織下所有工作區的異動。

* **Action：** `QGWAY_SEARCH` 查詢 `global-audit-view`。
* **Filter：** `where("orgId", "==", currentOrgId)`。

### 工作區管理員視角 (Workspace Audit)

> **需求：** 僅顯示當前工作區的任務與文件異動。

* **Action：** 查詢 `workspace-audit-view`。
* **Filter：** `where("workspaceId", "==", currentWsId)`。

---

## 🚨 異常處理 [R5]

若 Audit 投影失敗，應進入 `DLQ_S (SAFE_AUTO)` 進行自動重試，因為審計日誌具備冪等性。

---