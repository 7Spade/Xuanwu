# [索引 ID: @VS8-ROUTER] VS8 Semantic Router

## Scope

語義感知路由負責將 tag 與 policy 映射為可執行分發策略。

## Rules

- MUST: 路由決策先經 `policy-mapper` (`D27-A`)。
- FORBIDDEN: 以業務 ID 硬編碼路由。
- MUST: 路由輸入來自語義投影與受控上下文。

## Consumers

- Scheduling dispatch strategy
- Notification channel strategy
- Cost/finance decision bridge

## SSOT Phase 對齊（D27-A Routing in Protocol）

> 參考 SSOT：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`

### D27-A 語義路由在協議中的位置

D27-A 語義路由在 **Phase 2 的 L3 Domain 層**執行，時序發生於 L10 Genkit Orchestrator 完成 Step 2.10（AI→D3 返回最終排名）**之後**。

```
L10 Genkit 決策（Step 2.5–2.10）
  └─ D3 接收最終排名與推理軌跡
       └─ D27-A policy-mapper 執行語義路由（L3 Domain）
            ├─ Step 2.11: D3 → IER (L4)   【發布匹配決策事件 + reasons/traceRef】
            ├─ Step 2.12: IER → L4A (Audit)【稽核日誌：Who/Why/Evidence/Version/Tenant】
            └─ Step 2.13: IER → P5 (L5)   【按 Lane 分流投影事件】
```

### Lane 路由規則（SSOT Step 1.8 / Step 2.13）

路由結果依任務 **LANE** 分流：

| Lane | 說明 | Step 2.13 投影目標 |
|------|------|------------------|
| **CRITICAL** | 高優先合規任務（含強制證照要求） | P5/L5 優先通道，立即觸發 |
| **STANDARD** | 一般語義匹配任務 | P5/L5 標準通道，批次處理 |

> Lane 在 Step 1.8 寫入鏈確定，由任務 `complexityLevel` 與 `requiredCertifications` 共同決定。

### 路由輸出事件

| 步驟 | 路徑 | 說明 |
|------|------|------|
| **Step 2.11** | `D3 → IER (L4)` | 匹配決策事件（D29 攜帶 `reasons` + `traceRef`）；由 D27-A 路由後觸發 |
| **Step 2.12** | `IER → L4A (Audit)` | 稽核日誌寫入（五大欄位）；Step 2.11 完成後立即執行 |
| **Step 2.13** | `IER → P5/L5` | 依 Lane 分流投影事件；**Step 2.12 五大欄位完整**才可進入此步驟 |

### BF-1 回饋（Step 2.14）

D27-A 路由決策確認後，由 **D3 (L3 Domain)** 觸發業務指紋回饋：

- **Step 2.14**：`D3 → L8`，自動更新 `employees.skillEmbedding` 標籤權重（BF-1）
- **約束**：L10 Genkit / L4A / L5 均不可直接寫入 `skillEmbedding`；BF-1 回饋路徑唯一

---

> **規則摘要**：D27-A 語義路由規則是 Phase 2 匹配決策後的分流依據；路由結果透過 L4 IER（Step 2.11）分發至稽核（L4A）和投影（L5）。
