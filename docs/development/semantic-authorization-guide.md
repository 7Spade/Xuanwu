# 📖 Semantic Authorization & Identity 開發指南

## 📌 定位與核心哲學

本系統採用 **ReBAC (Relationship-Based Access Control)** 結合 **Semantic Tags**，並以 **VS8 (Semantic Graph)** 為唯一權限真相來源。

* **權限即關係：** 權限不是儲存在 User 身上，而是存在於 `VS8` 圖譜中的「邊 (Edge)」。
* **AI 與人同等：** 無論 Actor 是人類還是 AI Agent，皆須通過相同的語義路徑驗證。
* **SSOT 來源：** 所有權限判定必須引用 `VS8` 的投影結果。

---

## 🏗️ 權限維度與實體建模 (Nodes & Edges)

在 `VS8` 中，我們透過以下節點關係定義五大維度：

### 1. 實體定義 (Nodes)

* **Individual (Actor):** 系統使用者或 AI Agent。
* **Organization (Root):** 資源的最高層級。
* **Workspace (Context):** 業務執行的隔離邊界。
* **Team (Group):** 權限的集合容器。
* **Partner (External):** 具備 `tag::type:external` 標籤的特殊 Actor。

### 2. 關係建模 (Edges)

| 關係類型 | 方向 | 說明 | 參考規範 |
| --- | --- | --- | --- |
| `MEMBER_OF` | `Actor -> Org/Team` | 基礎歸屬關係。 | [VS1], [VS4] |
| `OWN_BY` | `Workspace -> Org` | 層級隸屬關係。 | [VS5] |
| `CAN_ACT` | `Actor -> Resource` | 具體的權限賦予，帶有 `tag::role` 屬性。 | [D21] |
| `REPRESENTS` | `AI_Agent -> Actor` | AI 代表人類執行任務時的權限繼承鏈路。 | [#A6] |

---

## 🛡️ 開發守則 (Hard Invariants)

* **[D24] 禁存權限字串：** 嚴禁在各業務 Slice（如 `VS5 Workspace`）的 Document 中直接儲存 `roles: ["admin"]` 等欄位。
* **[D21] 語義唯一性：** 所有新的權限標籤（例如 `tag::ability:archive`）必須在 `VS8` 的 `TAG_ENTITIES` 中定義，禁止各 Slice 自行創建。
* **[#A9] 範圍守衛：** 所有 Command 入口（`_actions.ts`）第一行必須執行 `ScopeGuard.verify(ctx, resourceId)`。
* **[S6] 強制刷新：** 當 `VS8` 的權限邊 (Edge) 發生異動時，必須由 `IER` 發送 `TOKEN_REFRESH_SIGNAL` 迫使 Client 更新 Token。

---

## 🛠️ 實作流程範例

### 寫入端：權限驗證 (Command Side)

當用戶嘗試在某個工作區刪除文件：

1. **L2 Gateway：** 從 `ACTIVE_CTX` 提取 `actorId`。
2. **L3 Guard：** 呼叫 `VS8_Service.searchPath()`。
3. **Path Search：** 尋找是否存在路徑：`Actor --(MEMBER_OF)--> Team --(CAN_ACT {role: 'manager'})--> Workspace`。
4. **結果：** 若路徑存在則放行；否則拋出 `INSUFFICIENT_PERMISSIONS [R5]`。

### 讀取端：資料過濾 (Query Side)

當用戶讀取「工作區列表」：

1. **QGWAY：** 向 `projection.user-nav-view` 發起請求。
2. **Filter：** 該視圖是由 `VS8` 投影而來，查詢條件為 `WHERE actorId == ctx.uid`，結果僅包含該用戶有權訪問的 `workspaceId`。

---

## 🤖 AI 協作特殊邏輯：動態授權 (Dynamic Escalation)

針對 AI 協作，我們引入 **「受限繼承 (Restricted Inheritance)」**：

1. **提權：** 當人類發出指令，`VS8` 建立臨時邊 `AI_Agent --(REPRESENTS {traceId})--> Human`。
2. **約束：** AI 的權限檢查會自動觸發 `AI_SAFETY_TAG` 過濾器，即使人類有該權限，AI 也可能因安全策略無法執行敏感動作。
3. **審計：** 所有 AI 行為必須帶有 `traceId [R8]` 以便回溯授權來源。

---

## 🚨 異常處理 [R5]

* **Permission Denied:** 返回 `403 FORBIDDEN` 並帶上缺失的 `tag::ability` 說明。
* **Path Timeout:** 若 `VS8` 路徑搜尋超時，預設執行 **FAIL_SAFE**，拒絕存取。