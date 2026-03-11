# patterns/ — Architecture Patterns

> **用途**：紀錄專案通用的設計模式、代碼組織規範與最佳實踐。相較於 ADR 的「決策過程」，此處更著重於「如何實作」的具體指引。

---

## 核心前提：邊界驗證先於 Mermaid

Serena 能做高品質 Mermaid 的前提，是先完成架構邊界驗證，不是直接畫圖。

## 核心治理：奧卡姆剃刀

- 當兩個方案都滿足 L1-L9 邊界、契約與安全要求時，優先採用依賴更少、路徑更短、解釋成本更低的方案。
- 奧卡姆剃刀不能凌駕邊界正確性；它只在「架構正確」之後，用來刪除多餘抽象、重複封裝與裝飾性流程。
- 新增層、目錄、adapter、wrapper 前，必須先回答：若不新增這一層，現有責任是否已經能清楚承載？若答案是能，則不新增。

### 標準順序

1. 驗證 L1-L3（平台/工作區/資源邊界）。
2. 驗證 L4（子資源 ownership、scope、parent_id 規則）。
3. 驗證 L5（行為守衛、狀態機、事件輸出）。
4. 建立 L6-L9（領域模型、契約、應用服務、基礎設施）。
5. 最後才產出或優化 Mermaid 圖。

若邊界未定義清楚（scope、owner、invariant、狀態轉移）就直接畫圖，圖面品質會高機率失真。

---

## 本專案主要架構模式

| Pattern | 說明 | 對應文件 |
|--------|------|---------|
| Hexagonal Architecture（Ports & Adapters）| 應用層依賴介面，基礎設施層提供實作 | `../blueprints/application-service-spec.md`, `../guidelines/infrastructure-spec.md` |
| Clean Architecture Layering | L1→L9 單向依賴，禁止逆向耦合 | `../README.md` |
| CQRS + Event Pipeline | Command 寫聚合；Read Model 由事件管線投影 | `../specs/contract-spec.md`, `../specs/org-workspace-feed-architecture.md` |
| Aggregate + Invariants | 用聚合根封裝狀態轉移與不變式 | `../models/domain-model.md` |
| Saga Orchestration | 跨聚合流程由 Saga 協調 | `../blueprints/application-service-spec.md` |
| Guard-first Command Handling | Scope / Idempotency / Optimistic Lock / Business Guard | `../specs/contract-spec.md` |
| Anti-Corruption Adapter Boundary | Firebase/Auth/Storage/Firestore SDK 形狀在 integration 邊界正規化，read/write 分離 | `../README.md` |
| Browser-safe Capability Adapter | Messaging/App Check/Analytics 先做 runtime 支援檢查，再決定初始化與事件流程 | `../README.md` |
| Capability Bootstrap Orchestration | 多個前端 capability 的初始化由單一 feature service 協調，避免 route/UI 重複拼裝 | `../README.md` |
| Route-level Responsibility Isolation | 首頁只做導流，重型 capability 與 graph 頁面各自成 route 並延遲載入 | `../README.md` |

---

## 採用準則

| 情境 | 優先模式 | 不建議做法 |
|-----|---------|-----------|
| 需要跨聚合資料一致性 | 事件 + Saga | 在單一 Command Handler 內硬寫跨聚合交易 |
| 需要高併發寫入保護 | Optimistic Lock + Idempotency | 靠前端重送或資料庫最後覆寫 |
| 需要跨工作區可讀視圖 | CQRS Read Model | 直接查詢多聚合表並即時計算 |
| 需要長流程協作 | 明確事件鏈 + 補償策略 | 隱式副作用（在 repository 中偷偷呼叫外部系統）|

---

## 與 ADR 的分工

- ADR：記錄「為何選這個方向」。
- patterns：記錄「如何在程式與文件裡落地」。

參考：`../adr/README.md`

---

## 文件同步規則

當 L1-L9 任一層有重大變更，至少同步以下文件：

1. `../README.md`（層級狀態與導覽）
2. `../adr/README.md`（決策索引）
3. `.serena` 或 repo 記憶中的架構目錄索引（catalog）

若變更涉及共享 UI、整合層或互動基礎設施，也要同步目前落地狀態，避免記憶與專案現況漂移。

---

## Mermaid 品質檢查清單（出圖前）

在產生 Mermaid 前，以下項目必須全部可回答：

1. `scope`：每個節點屬於 workspace / org / personal 何者？
2. `owner`：每個核心資源的 business owner 與 assignee 語義是否明確？
3. `invariant`：關鍵不變式（例如無環、不可變、門檻）是否已定義？
4. `state transition`：狀態機轉移條件與拒絕路徑是否完整？

若任一項為「否」，先補邊界文件，暫停 Mermaid 產圖。

---

## Mermaid Legend 標準（跨圖一致）

### 線型語義

- `-->`：同步流程（Command / blocking call）
- `-.->`：非同步事件（Event publish/consume）
- `==>`：強約束轉移（guard 通過後唯一主路徑）
- `x-->`：失敗/拒絕路徑（guard fail / validation fail）

### 節點色彩語義（建議）

- `#e8f4f8`：Workspace scope
- `#fef9e7`：Org scope
- `#eafaf1`：Personal scope
- `#fff3cd`：Read Model / Projection
- `#f8d7da`：Failure / Rejected 狀態

### 標記規則

- 每張圖至少標出一個 `Guard` 節點或註記（如 `ScopeGuard`、`ThresholdGuard`）。
- 每張圖至少標出一個可追溯到 L7 的 `Command` 或 `Event` 名稱。
- 若圖含失敗分支，必須標示 failure 類型（conflict / threshold / lock / idempotency）。