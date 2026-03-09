# 🏗 Technical Debt Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **資料來源 / Data Source**: `/audit` 全鏈路架構合規性審計 (2026-03-09)
> **說明**: 技術債是「已知的架構欠缺」，不阻礙當前生產，但會限制未來擴展能力或引入隱性風險。
>
> **注意**: TD-001~007 均已解決，歸檔至 `technical-debt-archive.md`。

---

## 優先級一覽 / Priority Overview

| ID     | 模組                                                | 規則          | 嚴重程度 | 狀態  |
|--------|-----------------------------------------------------|---------------|----------|-------|
| TD-008 | `context-selectors.ts`                              | D21-7, T5     | MEDIUM   | OPEN  |
| TD-009 | `command-gateway.fn.ts` 命令路由未實作               | R4, D12       | CRITICAL | OPEN  |
| TD-010 | `webhook.fn.ts` HMAC / 防護缺失                     | S5            | HIGH     | OPEN  |
| TD-011 | `ier.fn.ts` 事件扇出為空操作                          | #9, P1        | CRITICAL | OPEN  |
| TD-012 | `critical.lane.fn.ts` 下游投遞未實作                 | P1, S2        | HIGH     | OPEN  |
| TD-013 | `standard.lane.fn.ts` 投影寫入缺失                   | P1, S2        | HIGH     | OPEN  |
| TD-014 | `outbox-relay.fn.ts` IER 交付為 stub                | R1, S1        | HIGH     | OPEN  |
| TD-015 | `gateway-command/_gateway.ts` 缺少 RBAC 細化         | D12, Q4       | MEDIUM   | OPEN  |

---

## TD-008 · D21-7 / T5 — `context-selectors.ts` 純 Stub，VS8_PROJ 投影選擇器缺失

**嚴重程度**: MEDIUM · **狀態**: OPEN · **關聯規則**: D21-7, T5

### 背景

VS8 第 7 層 Projection（語義投影層）需要提供 `getReachableNodes()` 與 `getSemanticNeighbours()` 等
純讀選擇器，供 UI 和業務邏輯消費者在無需直接存取圖引擎的情況下取得語義上下文視圖 [T5]。

### 現狀

```
src/features/semantic-graph.slice/domain.output/projections/context-selectors.ts
  // TODO [VS8_PROJ]: Implement context selectors.
  //   Planned exports:
  //     - getReachableNodes(fromSlug: string): readonly string[]
  //     - getSemanticNeighbours(tagSlug: string, relationType?: RelationType): readonly string[]
```

目前該文件為純 stub，沒有任何可執行代碼。UI 無法透過正式投影 API 取得語義鄰居或可達節點，
必須直接依賴圖引擎內部儲存，違反 T5（語義讀取僅 L6）。

### 技術債務

- **T5 違規潛在風險**: UI 元件若需要可達節點資訊，可能繞過投影層直接呼叫圖引擎
- **VS8_PROJ 缺口**: 投影層選擇器 API 不完整，無法支援 workspace 語義視圖功能
- **測試覆蓋缺失**: 缺少對應的 context-selectors 單元測試

### 償還建議

1. 實作 `getReachableNodes(fromSlug, maxHops?)` — 委派至 `semantic-distance.computeSemanticDistance()`
2. 實作 `getSemanticNeighbours(tagSlug, relationType?)` — 委派至 `semantic-edge-store.getEdgesFrom()`
3. 加入對應的 Vitest 單元測試
4. 在 `_queries.ts` 中透過 barrel re-export 這些選擇器

**預估工作量**: 1-2 人天

---

## TD-009 · R4 / D12 — `command-gateway.fn.ts` 命令路由未實作，所有命令返回 501

**嚴重程度**: CRITICAL · **狀態**: OPEN · **關聯規則**: R4, D12

### 背景

`command-gateway.fn.ts` 是 CBG_ENTRY（L2 Command Gateway）的 Firebase Function 入口，
應負責接收 HTTP POST 命令、注入 traceId [R8]、驗證 authority-snapshot [Q4]，
並透過 command-router 路由至正確的 VS 切片 handler。

### 現狀

```typescript
// command-gateway.fn.ts — 目前的 stub 實作（所有命令均靜默返回 501）
res.status(501).json({
  error: { code: "NOT_IMPLEMENTED", message: `Command '${command}' on '${aggregateType}' is not yet routed` },
  traceId
});

// 缺失的兩個步驟：
// TODO: authority-interceptor → authority-snapshot validation
// TODO: command-router → route to VS1/VS2/VS3/VS4/VS5/VS6 slice handlers
```

所有透過 HTTP 入口的命令均返回 `501 NOT_IMPLEMENTED`。
Frontend 的 Command Bus（`gateway-command/_gateway.ts`）已有完整路由機制，
但 Firebase Function 層與其完全脫鉤，表示後端命令路徑在生產中完全不可用。

### 技術債務

- **後端命令路徑癱瘓**: 任何需要持久化的命令（寫入 Firestore）均無法透過 HTTP 入口完成
- **Authority-interceptor 缺失**: Firebase Function 無法驗證呼叫者的 AuthoritySnapshot [Q4]
- **分離的路由邏輯**: 前端 `_gateway.ts` 有路由機制但後端 Function 沒有，形成雙重標準

### 償還建議

1. 連接 Firebase Function 與前端 `gateway-command/_gateway.ts` 的 `handlerRegistry`（或複製路由邏輯）
2. 在 Firebase Function 加入 Firebase Auth token 驗證並建構 `AuthoritySnapshot` [Q4]
3. 實作命令派發：解析 `aggregateType:command` 路由至對應切片的 command handler

**預估工作量**: 5-8 人天

---

## TD-010 · S5 — `webhook.fn.ts` 缺少 HMAC 驗證、速率限制與熔斷器

**嚴重程度**: HIGH · **狀態**: OPEN · **關聯規則**: S5 (SK_RESILIENCE_CONTRACT)
**關聯安全審計**: SA-003

### 背景

Webhook 端點接收外部系統（支付處理商、第三方整合）的事件回調。
S5 要求實作三層防護：速率限制、HMAC 簽章驗證、熔斷器。

### 現狀

```typescript
// webhook.fn.ts — 三個未實作的防護
// TODO: verify HMAC signature against shared secret
// TODO: [S5] apply rate-limit per source identifier
// TODO: [S5] circuit-break on consecutive failures

// 同時缺少：
void data; // forwarded to command router (TODO)
// TODO: route to command-gateway CBG_ENTRY with injected traceId
```

目前 webhook 端點僅檢查 `x-webhook-signature` header 是否存在，
但**不驗證簽章正確性**，任何攜帶虛假 signature header 的請求均可通過。
接收到的事件也不會被路由至任何下游處理器。

### 技術債務

- **HMAC 驗證缺失（安全風險）**: 惡意請求可偽造任意 webhook 事件（見 SA-003）
- **事件路由缺失**: webhook 事件被記錄日誌後丟棄，不會進入 IER 或 command-gateway
- **S5 三層防護未實作**: 速率限制、熔斷器均為 TODO

### 償還建議

1. 加入 HMAC-SHA256 簽章驗證（shared secret 從 Firebase Secret 讀取）
2. 加入基於 `source` 識別符的速率限制（per-minute 閾值）
3. 實作事件路由：將 webhook payload 包裝為 `EventEnvelope` 並轉發至 IER

**預估工作量**: 3-5 人天

---

## TD-011 · #9 / P1 — `ier.fn.ts` 事件扇出為空操作，所有事件均未投遞至 Lane

**嚴重程度**: CRITICAL · **狀態**: OPEN · **關聯規則**: #9 (統一事件出口), P1 (優先級三道分層)

### 背景

IER（Integration Event Router）是整個事件匯流排的核心路由器 [#9]，
必須根據 P1 優先級規則（CRITICAL/STANDARD/BACKGROUND）將事件扇出至對應的 Lane 函式。

### 現狀

```typescript
// ier.fn.ts — 事件分類邏輯正確，但扇出（fan-out）完全缺失
// `resolveLane()` 能正確分類 CRITICAL/STANDARD/BACKGROUND；
// 問題在於分類後沒有任何呼叫下游 Lane 函式的代碼。
// TODO: fan-out to lane-specific functions or Pub/Sub topics
// Critical: immediate delivery for Role/Policy/Wallet events
// Standard: async delivery for domain events
// Background: eventual delivery for Tag/Audit events

res.status(202).json({ accepted: true, eventId, lane: resolvedLane, traceId });
```

`resolveLane()` 函數正確地將事件分類為 CRITICAL/STANDARD/BACKGROUND，
但分類後**僅記錄 `202 Accepted` 而不呼叫任何 Lane 函式**。
事件在 IER 消失，不會到達 `criticalLane`、`standardLane` 或背景 Lane。

### 技術債務

- **完整事件鏈中斷**: 所有流過 IER 的事件均被靜默吸收，下游 VS 無法收到事件
- **P1 優先級無效**: CRITICAL 事件無法立即觸發 Claims 刷新，WalletDeducted 不觸發投影
- **可觀測性缺失**: 沒有任何事件到達投影層，造成讀模型永久不一致

### 償還建議

1. 加入 CRITICAL_LANE_URL、STANDARD_LANE_URL 環境變數讀取
2. 依 `resolvedLane` 呼叫對應 Firebase Function（HTTP fetch 或 Pub/Sub publish）
3. 加入 delivery 失敗的重試邏輯，與 `outbox-relay.fn.ts` 的 DLQ 整合

**預估工作量**: 3-5 人天（需先完成 TD-012、TD-013）

---

## TD-012 · P1 / S2 — `critical.lane.fn.ts` 缺少下游 Claims 刷新和投影寫入

**嚴重程度**: HIGH · **狀態**: OPEN · **關聯規則**: P1, S2, S6

### 現狀

```typescript
// critical.lane.fn.ts
case "RoleChanged":
case "PolicyChanged":
  // TODO: call claims-refresh function or Pub/Sub

// TODO: route to CRITICAL_PROJ_LANE for projection writes [S2]
res.status(202).json({ accepted: true, lane: "CRITICAL", eventId });
```

`RoleChanged`/`PolicyChanged` 事件不觸發 Claims 刷新 [S6]；
所有 CRITICAL 事件均不寫入投影 [S2]。

### 技術債務

- **Claims 刷新失效 [S6]**: 角色變更後 Firebase Token 不會立即更新，導致授權決策延遲
- **CRITICAL 投影積壓**: 錢包餘額、授權快照等需強一致性的投影不會更新

**預估工作量**: 2-4 人天

---

## TD-013 · P1 / S2 — `standard.lane.fn.ts` 缺少 STANDARD_PROJ_LANE 投影寫入

**嚴重程度**: HIGH · **狀態**: OPEN · **關聯規則**: P1, S2

### 現狀

```typescript
// standard.lane.fn.ts
// TODO: forward to STANDARD_PROJ_LANE for projection writes [S2]
res.status(202).json({ accepted: true, lane: "STANDARD", eventId });
```

所有 STANDARD 事件（SkillXpAdded、MemberJoined 等）均不觸發投影寫入。
讀模型（`tasks-view`、`members-view` 等）永久處於陳舊狀態。

**預估工作量**: 2-3 人天

---

## TD-014 · R1 / S1 — `outbox-relay.fn.ts` IER 交付為空操作 Stub

**嚴重程度**: HIGH · **狀態**: OPEN · **關聯規則**: R1 (OUTBOX Relay), S1 (idempotency)

### 現狀

```typescript
// outbox-relay.fn.ts
async function deliverToIer(record: OutboxRecord): Promise<void> {
  // TODO: call IER function URL directly based on record.lane
  //   const ierUrl = process.env.IER_FUNCTION_URL;
  //   await fetch(ierUrl, { ... });
  logger.info("RELAY→IER stub", { eventId: record.eventId, structuredData: true });
}
```

`deliverToIer()` 只記錄日誌而不實際呼叫 IER，意味著：
- 重試邏輯（3 次退避）永遠不會觸發真正的失敗
- DLQ 移轉邏輯實際上無法被到達（因為 stub 永遠「成功」）
- 整個 Outbox → IER 交付鏈路是靜默空轉

### 技術債務

- **Outbox 鏈路完全斷路**: Outbox records 被永遠標記為「已投遞」但實際上沒有投遞任何事件
- **DLQ 整合未驗證**: 由於 stub 永遠成功，DLQ 移轉邏輯從未被真實測試

**預估工作量**: 1-2 人天（加入 `IER_FUNCTION_URL` 環境變數呼叫即可）

---

## TD-015 · D12 / Q4 — `gateway-command/_gateway.ts` 缺少 per-commandType RBAC 細化

**嚴重程度**: MEDIUM · **狀態**: OPEN · **關聯規則**: D12, Q4

### 現狀

```typescript
// gateway-command/_gateway.ts — checkAuthority()
// TODO: Enforce per-commandType RBAC checks [D12] — track in architecture backlog
//       as "gateway-command: role-based per-commandType permission enforcement".
```

目前 `checkAuthority()` 只檢查 `AuthoritySnapshot` 是否存在，任何擁有 snapshot 的呼叫者
均可執行任意 commandType，無法實施「只有 ADMIN 可執行 org:delete」等細粒度控制。

### 技術債務

- **D12 未落地**: 命令層缺少 role-based per-commandType 存取控制
- **安全邊界模糊**: 所有已認證的用戶對所有命令均有執行權，依賴 domain layer 自行攔截

**預估工作量**: 3-4 人天（設計 RBAC 矩陣 + 實作 + 測試）

---

## 償還路線圖 / Repayment Roadmap

```
Sprint N (立即行動 — 事件鏈):
  TD-014: outbox-relay.fn.ts IER 交付實作        — 解鎖整條事件鏈
  TD-011: ier.fn.ts 事件扇出實作                 — 依賴 TD-014
  TD-012: critical.lane.fn.ts 下游投遞           — 依賴 TD-011
  TD-013: standard.lane.fn.ts 投影寫入           — 依賴 TD-011

Sprint N+1 (Command Gateway 完整化):
  TD-009: command-gateway.fn.ts 命令路由          — 後端命令路徑
  TD-010: webhook.fn.ts HMAC + 路由              — 安全修復 (SA-003)

Sprint N+2 (語義投影 + 授權細化):
  TD-008: context-selectors.ts VS8_PROJ           — 語義讀取完整化
  TD-015: gateway-command RBAC 細化              — D12 合規
```

---

*最後更新: 2026-03-09 | 維護者: Copilot（TD-001~007 已歸檔；TD-008~015 新增）*
