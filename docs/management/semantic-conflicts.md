# ⚡ Semantic Conflicts Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **資料來源 / Data Source**: `/audit` 全鏈路架構合規性審計 (2026-03-09)
> **說明**: 語義衝突是「代碼中存在兩個相互矛盾的邏輯或定義」，與技術債（缺失實作）不同。

---

## 衝突一覽 / Conflict Overview

| ID     | 衝突描述                                      | 嚴重程度 | 狀態  |
|--------|-----------------------------------------------|----------|-------|
| SC-002 | `SK_STALENESS_CONTRACT` 雙重定義語義歧義      | MEDIUM   | OPEN  |
| SC-003 | `CausalityTracer` 不呼叫 `validateNotIsolated` — 假設與守衛脫鉤 | LOW | OPEN |

---

## SC-002 · MEDIUM — `SK_STALENESS_CONTRACT` 雙重定義，緩存鮮度語義歧義

**嚴重程度**: MEDIUM · **狀態**: OPEN · **關聯規則**: D4（Single Source of Truth）
**關聯 Security**: SA-002

### 衝突描述

`SK_STALENESS_CONTRACT`（緩存鮮度合約）在代碼庫中有兩個完全獨立的定義：

**定義一（shared-kernel，規範定義）**:
```typescript
// src/shared-kernel/infra-contracts/staleness-contract/index.ts
export const StalenessMs = {
  TAG_MAX_STALENESS: 30_000,       // 30s
  PROJ_STALE_CRITICAL: 500,        // 500ms
  PROJ_STALE_STANDARD: 10_000,     // 10s
  PROJ_STALE_DEMAND_BOARD: 5_000,  // 5s
} as const;
```

**定義二（Firebase Functions 側，獨立常量）**:
```typescript
// src/shared-infra/backend-firebase/functions/src/staleness-contract.ts
export const TAG_MAX_STALENESS_MS = 30_000;
export const PROJ_STALE_CRITICAL_MS = 500;
export const PROJ_STALE_STANDARD_MS = 10_000;
// ⚠️ 缺少 PROJ_STALE_DEMAND_BOARD（5000ms）！
```

目前兩份定義的數值相同，但命名規範不同（物件屬性 vs 頂層常量），
且 Firebase Functions 側**缺少 `PROJ_STALE_DEMAND_BOARD`** 條目。

### 衝突類型

這是 **Single Source of Truth（D4）** 違規的典型表現：
- 兩份定義各自獨立演化，沒有明確的「誰引用誰」規則
- 若未來調整鮮度閾值（例如 `TAG_MAX_STALENESS: 60_000`），
  修改者可能只更新一處，造成行為分裂

### 修復方向

**選項 A（推薦）**: Firebase Functions 側改為從 shared-kernel 重新導出
```typescript
// src/shared-infra/backend-firebase/functions/src/staleness-contract.ts
// 從 shared-kernel 重新導出，消除重複
export {
  StalenessMs,
  getSlaMs,
  isStale,
} from '../../../../shared-kernel/infra-contracts/staleness-contract';
```

**選項 B**: 確保兩側共享一個 npm package（適合 monorepo 架構重組後）

### 驗證步驟

確保 `src/shared-infra/backend-firebase/functions/src/staleness-contract.ts`
中不再有任何獨立的鮮度數值常量定義。

---

## SC-003 · LOW — `CausalityTracer` 不呼叫 `validateNotIsolated`，D21-C 守衛形同虛設

**嚴重程度**: LOW · **狀態**: OPEN · **關聯規則**: D21-C, D21-H

### 衝突描述

`hierarchy-manager.ts` 的 `validateNotIsolated()` 函數（TD-004 已完成實作）
提供了「驗證節點是否已掛載至父節點」的能力，是 D21-C（無孤立節點）的守衛函數。

然而，`causality-tracer.ts` 的 `traceAffectedNodes()` 在執行因果追蹤 BFS 時，
**完全未呼叫 `validateNotIsolated()`**，假設傳入的起始節點 slug 一定存在且已連接。

```typescript
// causality-tracer.ts — 第 177-196 行
export function traceAffectedNodes(
  event: TagLifecycleEvent,
  candidateSlugs: readonly string[],
  maxHops = 5
): readonly AffectedNode[] {
  const sourceSlug = event.tagSlug as string;
  // ❌ 缺少：validateNotIsolated(event.tagSlug) 前置驗證
  // 如果 sourceSlug 不存在於圖中，BFS 會直接返回空結果而不報錯
  const entries = _bfsAffected(sourceSlug, new Set(candidateSlugs), maxHops);
  // ...
}
```

### 語義矛盾

| 組件                      | 宣稱的保證                                | 實際狀況                           |
|---------------------------|-------------------------------------------|------------------------------------|
| `hierarchy-manager.ts`    | `validateNotIsolated()` 確保節點已掛載    | 函數存在但沒有被 CausalityTracer 呼叫 |
| `CausalityTracer`         | 假設 `tagSlug` 一定存在且非孤立            | 孤立節點會造成靜默空結果，不報錯    |
| D21-C 規則                | 語義圖中不得有孤立節點                     | 守衛函數與使用者脫鉤，無法強制執行  |

### 實際風險

如果一個 `TagLifecycleEvent` 的 `tagSlug` 指向一個孤立節點（尚未掛載至父節點）：
- BFS 會立即返回空結果（因為沒有任何邊從孤立節點出發）
- 呼叫方收到空的 `affectedNodes`，誤認為「此事件無下游影響」
- 不會拋出任何錯誤或警告，靜默失敗

### 修復方向

在 `traceAffectedNodes()` 入口處加入 D21-C 前置驗證：

```typescript
import { validateNotIsolated } from '../../core/nodes/hierarchy-manager';

export function traceAffectedNodes(
  event: TagLifecycleEvent,
  candidateSlugs: readonly string[],
  maxHops = 5
): readonly AffectedNode[] {
  // [D21-C] 確認起始節點已掛載至父節點（非孤立）
  if (!validateNotIsolated(event.tagSlug)) {
    // 孤立節點的因果鏈為空；可選擇拋出或靜默返回
    console.warn(`[D21-C] traceAffectedNodes: slug "${event.tagSlug as string}" is isolated, returning empty chain`);
    return [];
  }
  // ...（原有 BFS 邏輯）
}
```

**預估工作量**: 半天（1-2 個程式變更 + 測試補充）

---

## 語義衝突解決原則 / Resolution Principles

當兩個模組對同一業務規則有衝突的實作時，裁決優先序如下：

1. **守衛層（D21-H BBB）** > 存儲層：守衛層的「拒絕」語義優先於存儲層的「靜默接受」
2. **shared-kernel（D4 SSOT）** > feature slice：全局定義優先於局部覆蓋
3. **明確驗證** > 隱式假設：有明確驗證的邏輯優先於依賴假設的邏輯

---

*最後更新: 2026-03-09 | 維護者: Copilot（SC-002 補充雙重定義具體路徑；SC-003 更新：TD-004 已解決，但 CausalityTracer 仍未接線）*
