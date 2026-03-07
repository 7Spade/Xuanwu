# 01 - Shared Kernel & Contracts (L1 / VS0)

L1/VS0 契約。SK 契約集中定義，所有節點僅引用不重複宣告。

## 基礎資料契約 [#8]
- **SK_ENV (event-envelope)**: `version` · `traceId` · `causationId` · `correlationId` · `timestamp`
  - idempotency-key = `eventId+aggId+version`
  - **[R8]** traceId 整鏈共享・不可覆蓋。
  - causationId = 觸發此事件的命令/事件 ID。
  - correlationId = 同一 saga/replay 的關聯 ID。
- **SK_AUTH_SNAP (authority-snapshot)**: `claims` / `roles` / `scopes` (TTL = Token 有效期)
- **SK_SKILL_TIER (skill-tier)**: 純函式 `getTier(xp)→Tier`，永遠推導，永不存 DB [#12]。
- **SK_SKILL_REQ (skill-requirement)**: `tagSlug × minXp` 跨片人力需求契約。
- **SK_CMD_RESULT (command-result-contract)**: Success `{ aggregateId, version }`, Failure `{ DomainError }` (前端樂觀更新依據)。

## 基礎設施行為契約 [#8]

### SK_OUTBOX_CONTRACT [S1]
1. `at-least-once` : EventBus → OUTBOX → RELAY → IER
2. **idempotency-key** 必帶，格式為 `eventId+aggId+version`
3. **DLQ 分級宣告** (每 OUTBOX 必填)：
   - `SAFE_AUTO`：冪等事件・自動重試
   - `REVIEW_REQUIRED`：金融/排班/角色・人工審
   - `SECURITY_BLOCK`：安全事件・凍結+告警

### SK_VERSION_GUARD [S2]
- `event.aggregateVersion > view.lastProcessedVersion` → 允許更新
- 否則 → 丟棄（過期事件不覆蓋）
- **適用全部 Projection [S2, #19]**

### SK_READ_CONSISTENCY [S3]
- `STRONG_READ` → Aggregate 回源（適用：金融・安全・不可逆）
- `EVENTUAL_READ` → Projection（適用：顯示・統計・列表）
- 規則：餘額/授權/排班衝突 → STRONG_READ

### SK_STALENESS_CONTRACT [S4]
- `TAG_MAX_STALENESS` ≤ 30s
- `PROJ_STALE_CRITICAL` ≤ 500ms
- `PROJ_STALE_STANDARD` ≤ 10s
- 各節點引用此常數・禁止硬寫數值。

### SK_RESILIENCE_CONTRACT [S5]
- **R1 rate-limit**: `per user ∪ per org` → 429
- **R2 circuit-break**: 連續 5xx → 熔斷
- **R3 bulkhead**: 切片隔板・獨立執行緒池
- (適用：`_actions.ts` / Webhook / Edge Function)

### SK_TOKEN_REFRESH_CONTRACT [S6]
- **觸發**：`RoleChanged | PolicyChanged` → IER `CRITICAL_LANE` → `CLAIMS_HANDLER`
- **完成**：`TOKEN_REFRESH_SIGNAL`
- **客端義務**：強制重取 Firebase Token。
- **失敗**：→ DLQ `SECURITY_BLOCK` + 告警。

## Infrastructure Ports（依賴倒置介面）[D24]
- `IAuthService`: 身份驗證 Port
- `IFirestoreRepo`: Firestore 存取 Port [S2]
- `IMessaging`: 訊息推播 Port [R8]
- `IFileStore`: 檔案儲存 Port
