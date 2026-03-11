# 🗂 Active Issues Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **資料來源 / Data Source**: VS5 Files + Document Parser flow review + backend gateway audit (2026-03-09)
> **格式說明**: 每條目包含 [❗ 違規] [🔍 現狀] [🛠 修正方案] [📈 影響評估]
> **最後更新**: 2026-03-09 — ISSUE-009、ISSUE-010 已確認修復並移至 `issues-archive.md`；ISSUE-012~015 新增（後端事件鏈盤點）。

> **執行進度 / Execution Progress**
> - ISSUE-008: `IN_PROGRESS`（Files 動作來源矩陣已實作；缺 UI 標記與整合測試）
> - ISSUE-009: `RESOLVED`（已歸檔至 `issues-archive.md`）
> - ISSUE-010: `RESOLVED`（已歸檔至 `issues-archive.md`）
> - ISSUE-011: `OPEN`（待導入非同步 landing + request 去重與重入保護）
> - ISSUE-012: `OPEN`（後端 Command Gateway 路由未接通，所有命令返回 501）
> - ISSUE-013: `OPEN`（IER 事件扇出為空操作，整條事件鏈斷路）
> - ISSUE-014: `OPEN`（Outbox Relay IER 交付為 stub，Outbox 鏈路空轉）
> - ISSUE-015: `OPEN`（Webhook HMAC 驗證缺失，端點安全漏洞）

---

## ISSUE-008 · CRITICAL — 動作來源契約未鎖定：`document-ai` 與 `genkit-ai` 可能對錯誤來源執行

[❗ 違規]
- Files 動作缺少可見且可驗證的「來源契約」，與使用語義 `DOCUMENT YOU / GENKIT YOU HAVE` 不一致。
- 依 D27 / #A14，解析入口應維持語義單向與明確分流，不可讓錯誤來源進入錯誤流程。

[🔍 現狀（2026-03-09 確認）]
- 來源矩陣邏輯**已部分實作**（`files-table.tsx` 第 113-116 行）：
  ```typescript
  const canRunDocumentAi = !isCurrentStructuredFile && Boolean(documentAiVersion?.downloadURL);
  // genkitSourceType：若存在關聯 sidecar 則為 'structured-sidecar'，否則為 'original'
  const genkitSourceType: 'original' | 'structured-sidecar' =
    isCurrentStructuredFile ? 'original' : 'structured-sidecar';  // (根據關聯 sidecar 邏輯決定)
  const canRunGenkitAi = Boolean(genkitAiSourceVersion?.downloadURL && genkitAiSourceFile);
  ```
  sidecar 列已禁用 `document-ai`，且 `genkit-ai` 依關聯來源可用（`parseMode` 和 `sourceType` 已帶入 payload）。
- **仍缺**：
  1. UI 明確來源標記（`source: original` / `source: structured-sidecar`）顯示在 Actions menu
  2. 三組整合測試：`original-only`、`original+sidecar`、`sidecar-only` 場景
- 現場語義需求：
  - `DOCUMENT YOU`: 原始文件走 `document-ai`
  - `GENKIT YOU HAVE`: 有結構化 sidecar 才能走 `genkit-ai`

[🛠 修正方案]
- 在 actions menu 顯示來源標記：`source: original` 或 `source: structured-sidecar`。
- 加入三組 UI 測試：`original-only`、`original+sidecar`、`sidecar-only`。

[📈 影響評估]
- 影響層級：VS5 Files→Parser 入口正確性。
- 風險：錯誤來源進 OCR 或語義解析會造成結果失真與操作混淆。

---

## ISSUE-011 · HIGH — `document-ai` / `genkit-ai` 缺少非同步 landing，導致重複觸發與重入風險

[❗ 違規]
- 目前 Files -> Parser 互動是「同步直送 + 立即跳頁」，沒有非同步 landing（queued/submitted/processing/completed）狀態。
- 缺少 request 去重與重入保護，違反操作可觀測與一次提交語義，容易造成重複解析。

[🔍 現狀]
- `use-workspace-files-actions.ts` 的 `handleParseWithAi` 直接 `setPendingParseFile(...)` 後 `router.push('/document-parser')`，沒有 pending lock 或 submit token。
- `files-table.tsx` 的 `Document AI / Genkit AI` 動作在送件後未進入「送件中」狀態，使用者可連續重點造成多次送件。
- `document-parser-view.tsx` 採 mount 時自動觸發 `triggerParseFromURL(...)`，目前未檢查「同 sourceFileId/sourceVersionId/parseMode 是否已在執行」。

[🛠 修正方案]
- 導入「非同步 landing」：Files 端只建立 parse request（或 intent）並導向 landing，顯示 `queued -> processing -> completed/failed`。
- 導入去重鍵：`{workspaceId, sourceFileId, sourceVersionId, parseMode}`，同鍵在有效期間內僅允許一個 in-flight request。
- UI 防重複：按鈕送出後 disabled + spinner，直到 request 進入可追蹤狀態（queued）再解除；同時提供「查看既有任務」入口而非再次提交。
- Parser 端加入重入檢查：若命中 in-flight key，直接回傳既有 requestId/intentId，不再重跑 OCR。
- 增加整合測試：連點 2~5 次 `document-ai`/`genkit-ai`，驗證只產生單一 parse request 與單一 OCR 執行紀錄。

[📈 影響評估]
- 影響層級：VS5 Files / Document Parser 交互一致性、成本控制與可觀測性。
- 風險：重複操作會造成重複 OCR 呼叫、重複解析成本、審計噪音與使用者混淆（不確定是否已送出）。

---

## ISSUE-012 · CRITICAL — 後端 Command Gateway 路由未接通，所有命令返回 501

[❗ 違規]
- `command-gateway.fn.ts`（CBG_ENTRY, L2）目前所有命令均返回 `501 NOT_IMPLEMENTED`。
- 依 R4（命令路由），命令應被路由至正確的 VS 切片 handler；依 Q4（authority-interceptor），
  應進行 AuthoritySnapshot 驗證。兩者均未實作。

[🔍 現狀]
- Firebase Function `commandGateway` 已實作 [R8] traceId 注入和 [S5] 速率限制。
- 但 authority-interceptor 和 command-router 均缺失：
  ```typescript
  // TODO: authority-interceptor → authority-snapshot validation
  // TODO: command-router → route to VS1/VS2/VS3/VS4/VS5/VS6 slice handlers
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", ... } });
  ```
- 前端的 `gateway-command/_gateway.ts` 有完整的路由機制（`handlerRegistry`），
  但後端 Function 完全脫鉤——任何需要持久化的命令均無法完成。

[🛠 修正方案]
- 在 Firebase Function 加入 Firebase Auth token 驗證並建構 `AuthoritySnapshot` [Q4]。
- 連接 command-router：解析 `aggregateType:command` 並路由至對應切片的 Cloud Function handler。
- 詳見 `technical-debt.md` TD-009。

[📈 影響評估]
- 影響層級：生產環境所有寫入操作完全不可用（命令路徑）。
- 風險：目前所有命令靜默失敗（501），使用者可能認為寫入成功，但實際無任何持久化。

---

## ISSUE-013 · CRITICAL — IER 事件扇出為空操作，整條事件鏈於 IER 靜默中斷

[❗ 違規]
- `ier.fn.ts`（Integration Event Router, #9）在接收事件後僅記錄 202 而不實際路由至任何 Lane。
- 依 P1（優先級三道分層），CRITICAL 事件應立即投遞至 `criticalLane`；
  STANDARD 事件異步投遞至 `standardLane`；BACKGROUND 事件最終投遞至 `backgroundLane`。

[🔍 現狀]
- `resolveLane()` 正確分類事件為 CRITICAL / STANDARD / BACKGROUND。
- 但分類後不執行任何扇出：
  ```typescript
  // TODO: fan-out to lane-specific functions or Pub/Sub topics
  res.status(202).json({ accepted: true, eventId, lane: resolvedLane, traceId });
  ```
- 結果：所有域事件在 IER 被靜默吸收，下游 VS（VS1~VS7）永遠收不到任何事件。
  讀模型（`tasks-view`、`members-view` 等）永久陳舊，授權快照不更新。

[🛠 修正方案]
- 加入 `CRITICAL_LANE_URL`、`STANDARD_LANE_URL`、`BACKGROUND_LANE_URL` 環境變數。
- 依 `resolvedLane` 呼叫對應 Firebase Function（HTTP fetch 或 Pub/Sub publish）。
- 詳見 `technical-debt.md` TD-011。

[📈 影響評估]
- 影響層級：整個事件驅動架構的核心路由器失效，所有 CQRS 寫入後的讀側更新完全不可用。
- 風險：讀模型與寫模型永久不一致，影響排班、通知、XP 積分等所有功能的讀取結果。

---

## ISSUE-014 · HIGH — Outbox Relay IER 交付為 Stub，Outbox 鏈路空轉

[❗ 違規]
- `outbox-relay.fn.ts` 的 `deliverToIer()` 函數只記錄日誌而不呼叫 IER，
  違反 [R1]（OUTBOX Relay 應確保 at-least-once 投遞）和 [S1]（idempotency key 機制）。

[🔍 現狀]
```typescript
// outbox-relay.fn.ts
async function deliverToIer(record: OutboxRecord): Promise<void> {
  // TODO: call IER function URL directly based on record.lane
  logger.info("RELAY→IER stub", { eventId: record.eventId, ... });
  // 永遠靜默成功（不拋出錯誤）→ 重試邏輯永遠不觸發 → DLQ 永遠不被到達
}
```

Outbox 中所有記錄均被標記為「已投遞」但實際沒有投遞任何事件。
DLQ 移轉邏輯從未被真實測試（因為 stub 永遠成功）。

[🛠 修正方案]
- 加入 `IER_FUNCTION_URL` 環境變數讀取。
- 在 `deliverToIer()` 中以 `fetch()` 呼叫 IER，失敗則拋出錯誤觸發重試邏輯。
- 詳見 `technical-debt.md` TD-014。

[📈 影響評估]
- 影響層級：Outbox 模式的可靠性保證完全失效，S1（at-least-once）契約形同虛設。
- 風險：事件不會進入 IER，即使修復 ISSUE-013（IER 扇出），也需要先修復此問題才能測試。

---

## ISSUE-015 · HIGH — Webhook HMAC 驗證缺失，任意請求可偽造進入系統

[❗ 違規]
- `webhook.fn.ts` 僅檢查 `x-webhook-signature` header 是否存在，不驗證簽章正確性，
  違反 [S5]（SK_RESILIENCE_CONTRACT）和 OWASP A07:2021（身份驗證失敗）。

[🔍 現狀]
```typescript
// webhook.fn.ts — 偽驗證邏輯
const signature = req.headers["x-webhook-signature"] as string | undefined;
if (!signature) { res.status(401)... }
// TODO: verify HMAC signature against shared secret  ← 從未執行
```

任何攜帶 `x-webhook-signature: any-fake-value` 的 HTTP POST 均可通過此「驗證」。
一旦 ISSUE-013 修復（IER 扇出實作），此漏洞將升級為可注入任意域事件的 CRITICAL 漏洞。

[🛠 修正方案]
- 加入 HMAC-SHA256 驗證（從 Firebase Secret 讀取 signing secret）。
- 加入速率限制（per source identifier）。
- 詳見 `security-audits.md` SA-003 和 `technical-debt.md` TD-010。

[📈 影響評估]
- 影響層級：外部事件入口安全性（與 IER 扇出實作後風險升級為 CRITICAL）。
- 風險：攻擊者可偽造 `WalletCredited`、`RoleChanged` 等事件進入系統，污染讀模型和觸發錯誤的授權刷新。
- **修復優先建議**：應在 ISSUE-013（IER 扇出實作）之前或同時修復此問題，避免 IER 生效後產生安全漏洞視窗。

---

*最後更新: 2026-03-09 | 維護者: Copilot（後端閘道盤點：ISSUE-012~015 新增）*
