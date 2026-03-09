# 🔒 Security Audits Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **資料來源 / Data Source**: `/audit` 全鏈路架構合規性審計 (2026-03-09)
> **說明**: 安全審計聚焦於可被惡意利用或引發資料完整性破壞的架構漏洞。

---

## 嚴重程度一覽 / Severity Overview

| ID     | 模組                                           | 規則        | 嚴重程度 | 狀態  |
|--------|------------------------------------------------|-------------|----------|-------|
| SA-002 | `SK_STALENESS_CONTRACT` 雙重定義               | D4          | MEDIUM   | OPEN  |
| SA-003 | `webhook.fn.ts` 缺少 HMAC 簽章驗證            | S5, OWASP   | HIGH     | OPEN  |
| SA-004 | `process-document.fn.ts` 硬編碼 GCP Project ID | 安全配置   | MEDIUM   | OPEN  |

---

## SA-002 · MEDIUM — `SK_STALENESS_CONTRACT` 雙重定義，鮮度語義歧義

**嚴重程度**: MEDIUM · **狀態**: OPEN
**關聯規則**: D4 (Single Source of Truth), D8 (Cost-Output Contract)

### 漏洞描述

`SK_STALENESS_CONTRACT`（緩存鮮度合約）在代碼庫中存在**兩個獨立定義**，
雙方定義的 `maxAgeMs` 值可能不一致，導致緩存失效邏輯依賴哪個定義而呈現不同行為。

### 現狀

已確認兩處 `SK_STALENESS_CONTRACT` 相關定義：

1. `src/shared-kernel/infra-contracts/staleness-contract/index.ts` — 定義 `StalenessMs` 物件：
   ```typescript
   export const StalenessMs = {
     TAG_MAX_STALENESS: 30_000,
     PROJ_STALE_CRITICAL: 500,
     PROJ_STALE_STANDARD: 10_000,
     PROJ_STALE_DEMAND_BOARD: 5_000,
   } as const;
   ```

2. `src/shared-infra/backend-firebase/functions/src/staleness-contract.ts` — 定義獨立常量：
   ```typescript
   export const TAG_MAX_STALENESS_MS = 30_000;
   export const PROJ_STALE_CRITICAL_MS = 500;
   export const PROJ_STALE_STANDARD_MS = 10_000;
   // 注意：缺少 PROJ_STALE_DEMAND_BOARD 定義
   ```

目前數值一致，但兩份定義完全獨立維護。Firebase Functions 側的定義
**缺少 `PROJ_STALE_DEMAND_BOARD`（5000ms）** 的定義，存在遺漏。

### 安全風險

1. **緩存投毒（過期鮮度）**: 如果 Firebase Functions 側的 `TAG_MAX_STALENESS_MS` 日後被單獨修改，
   `shared-kernel` 側不會自動同步，導致語義查詢結果陳舊
2. **`PROJ_STALE_DEMAND_BOARD` 缺失**: Firebase Functions 若需要排班投影鮮度常量，
   會直接硬編碼數值，繞過 S4 合約
3. **升級漂移**: 兩份定義獨立演化，維護者需要記得同時更新兩處

### 修復方案

1. 在 `src/shared-infra/backend-firebase/functions/src/staleness-contract.ts` 改為
   從 shared-kernel 重新導出，而非獨立定義
2. 或在 Firebase Functions 的 `package.json` 加入 `@xuanwu/shared-kernel` 依賴

```bash
# 快速定位重複定義
grep -rn "SK_STALENESS_CONTRACT\|maxAgeMs.*staleness\|STALENESS_CONTRACT" src/
```

### 驗證步驟

確保整個代碼庫中 `SK_STALENESS_CONTRACT` 或等效常量只有一個定義來源。

---

## SA-003 · HIGH — `webhook.fn.ts` 缺少 HMAC 簽章驗證，Webhook 端點完全開放

**嚴重程度**: HIGH · **狀態**: OPEN
**關聯規則**: S5 (SK_RESILIENCE_CONTRACT), OWASP A07:2021 (身份驗證失敗)
**關聯技術債**: TD-010

### 漏洞描述

`webhook.fn.ts` 的 Webhook 入口點檢查了 `x-webhook-signature` header 是否存在，
但**完全未驗證簽章的正確性**。攻擊者只需在請求中加入任意 `x-webhook-signature` header，
即可偽造任意 webhook 事件進入系統。

### 現狀

```typescript
// webhook.fn.ts — 當前的「驗證」邏輯（第 29-36 行）
const signature = req.headers["x-webhook-signature"] as string | undefined;
if (!signature) {
  res.status(401).json({ error: "Missing webhook signature" });
  return;
}

// TODO: verify HMAC signature against shared secret
// TODO: [S5] apply rate-limit per source identifier
// TODO: [S5] circuit-break on consecutive failures
```

僅檢查 `signature` 是否存在（truthy 檢查），不驗證其加密正確性。
任何攜帶 `x-webhook-signature: fake` 的請求均可通過此驗證。

### 攻擊向量

1. **事件注入**: 攻擊者可偽造任意 `eventType` 和 `data`，例如偽造
   `WalletCredited` 事件或 `RoleChanged` 事件
2. **資料污染**: 惡意事件進入 IER 後可能觸發投影寫入，污染讀模型
3. **DoS 攻擊**: 缺少速率限制 [S5]，攻擊者可暴力發送請求消耗 Cloud Function 資源

> ⚠️ **條件嚴重程度升級**: 一旦 TD-011（IER 扇出）實作後，此漏洞的嚴重程度將從 HIGH 升級為 **CRITICAL**，
> 因為偽造事件將能直接觸發投影寫入和授權刷新。
> **建議在 TD-011 實作之前完成 HMAC 驗證修復（SA-003）**。

### 修復方案

```typescript
// 建議的 HMAC-SHA256 驗證實作
import { createHmac, timingSafeEqual } from "crypto";

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(`sha256=${expected}`, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  // 使用 timingSafeEqual 防止計時攻擊
  return expectedBuf.length === actualBuf.length &&
    timingSafeEqual(expectedBuf, actualBuf);
}

// 在 Firebase Functions 中從 Secret Manager 讀取 secret
const WEBHOOK_SECRET = process.env.WEBHOOK_SIGNING_SECRET ?? "";
```

**優先修復步驟**:
1. 立即加入 HMAC-SHA256 驗證（阻斷注入攻擊）
2. 從 Firebase Secret 讀取 `WEBHOOK_SIGNING_SECRET`，禁止硬編碼
3. 加入速率限制（Redis 計數器或 Firestore 時間窗計數）

### 驗證步驟

- 發送攜帶偽造簽章的 HTTP POST 請求，應收到 401
- 發送正確簽章的請求，應收到 202

---

## SA-004 · MEDIUM — `process-document.fn.ts` 硬編碼 GCP Project ID 和 Processor 路徑

**嚴重程度**: MEDIUM · **狀態**: OPEN
**關聯規則**: OWASP A05:2021 (安全配置錯誤), 最小暴露原則

### 漏洞描述

`process-document.fn.ts` 直接在原始碼中硬編碼了 Google Cloud Document AI 的
Project ID（`65970295651`）和 Processor 路徑，違反了秘密管理的最佳實踐。

### 現狀

```typescript
// process-document.fn.ts — 第 13-17 行
// Temporary hardcoded config for first successful integration.
// TODO: Replace with env vars after validation in real environment.
const DOCAI_ENDPOINT = "asia-southeast1-documentai.googleapis.com";
const DOCAI_PROCESSOR_NAME =
  "projects/65970295651/locations/asia-southeast1/processors/86a3e4af9c5bba38";
```

### 安全風險

1. **GCP Project ID 暴露**: Project ID 雖然本身非密鑰，但其在 git 歷史中的存在
   使攻擊者可更精準地針對該 GCP 項目進行偵測（資訊暴露）

   > ⚠️ **立即行動**: 此值已存在於 `main` 分支的 git 歷史中，即使在後續 commit 中移除，
   > 舊 commit 仍可通過 `git log` 查詢到。應同時評估是否需要透過 `git-filter-repo`
   > 清除歷史，或通知 GCP 方評估影響。

2. **Processor ID 暴露**: 惡意行為者若取得 IAM 最小權限，可利用已知 Processor 路徑
   直接針對 Document AI 資源發起請求
3. **環境不可分離**: 同一份代碼無法在不同環境（dev/staging/prod）使用不同的 Processor
4. **程式碼審計風險**: CI/CD 日誌或 PR diff 可能暴露這些值給外部貢獻者

### 修復方案

```typescript
// 建議做法：從環境變數或 Firebase Secret 讀取
const DOCAI_ENDPOINT = process.env.DOCAI_ENDPOINT ??
  "asia-southeast1-documentai.googleapis.com";
const DOCAI_PROCESSOR_NAME = process.env.DOCAI_PROCESSOR_NAME;
if (!DOCAI_PROCESSOR_NAME) {
  throw new Error("DOCAI_PROCESSOR_NAME environment variable is required");
}
```

Firebase Functions 環境變數設定（不進入 git 歷史）：
```bash
firebase functions:config:set docai.processor_name="projects/.../processors/..."
# 或使用 Firebase Secret Manager
firebase functions:secrets:set DOCAI_PROCESSOR_NAME
```

### 緊急處置

1. 確認此 Processor ID 是否已在生產環境中被外部獲取
2. 評估是否需要重新配置 IAM 權限以限制對此 Processor 的訪問
3. 在下一次 commit 中移除硬編碼值並改用環境變數

### 驗證步驟

確認 `src/shared-infra/backend-firebase/functions/src/document-ai/process-document.fn.ts`
中不存在任何 `projects/` 字面量。

---

## 安全審計備註 / Audit Notes

### D21-H BBB 架構強制執行狀態

| 層次                          | 是否強制執行 BBB 守衛 | 備注                                  |
|-------------------------------|----------------------|---------------------------------------|
| `centralized-guards/`         | ✅ 實作完整          | `validateEdgeProposal()` 覆蓋全部規則 |
| `centralized-edges/addEdge()` | ✅ 已收斂守衛入口     | SA-001 已修復並歸檔                   |
| `centralized-neural-net/`     | ✅ 僅讀，無寫入路徑  | 無安全風險                            |
| `projections/`                | ✅ 僅讀，無寫入路徑  | 無安全風險                            |
| `webhook.fn.ts`               | ❌ HMAC 驗證缺失     | SA-003（HIGH）                        |
| `command-gateway.fn.ts`       | ⚠️ authority check 存在但 RBAC 粒度不足 | TD-015（MEDIUM）           |

### 下一次審計計劃

- **觸發條件**: SA-003 修復完成後，以及 TD-011（IER 扇出）實作後
- **重點**: 確認所有進入 IER 的事件均通過簽章驗證；command-gateway RBAC 細化後驗證
- **計劃日期**: Sprint N+1 結束時

---

*最後更新: 2026-03-09 | 維護者: Copilot（SA-003、SA-004 新增）*
