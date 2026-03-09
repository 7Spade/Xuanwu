<!-- markdownlint-disable-file -->
# 🏗 Architecture Compliance Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-architecture-standards.md`、`docs/architecture/00-logic-overview.md`
> **資料來源 / Data Source**: 全專案命名與路徑合規審計 (2026-03-09)
> **說明**: 本文件追蹤與 `00-architecture-standards.md` 命名/路徑規範不符之現狀，並記錄修正計畫。

---

## 執行進度 / Execution Progress

| ID | 模組 | 違規類型 | 狀態 |
|----|------|----------|------|
| AC-001 | `account.slice/user.profile/` | 目錄命名：`user.*` → `domain.*` | ✅ RESOLVED |
| AC-002 | `account.slice/user.wallet/` | 目錄命名：`user.*` → `domain.*` | ✅ RESOLVED |
| AC-003 | `notification-hub.slice/user.notification/` | 目錄命名：`user.*` → `domain.*` | ✅ RESOLVED |
| AC-004 | `semantic-graph.slice/governance/` | 目錄命名：`governance/` → `gov.{name}/` | 📋 PLANNED |
| AC-005 | `semantic-graph.slice/{graph,reasoning,routing,learning,output,workflows}/` | 目錄命名：應包在 `domain.*` 或 `gov.*` | 📋 PLANNED |
| AC-006 | `workforce-scheduling.slice/{application,domain,ports,ui}/` | 整體結構：不符合標準切片結構 | 📋 PLANNED |
| AC-007 | `workspace.slice/application/` | 目錄命名：非標準，應整合至 `domain.*` 或 `core/` | 📋 PLANNED |
| AC-008 | `skill-xp.slice/skill-outbox.ts` | 檔名：outbox 應在 `core.event-store/` 下 | 📋 PLANNED |
| AC-009 | `account.slice/acc-outbox.ts` | 檔名：outbox 應在 `core.event-store/` 下 | 📋 PLANNED |
| AC-010 | `account.slice/account-event-bus.ts` | 檔名：event-bus 應在 `core.event-bus/` 下 | 📋 PLANNED |

---

## 已解決項目

### AC-001 · `account.slice/user.profile/` → `domain.profile/`

**違規依據**: §3.1 切片內子領域資料夾使用 `domain.<name>` 或 `gov.<name>`；`user.*` 前綴未定義在標準中。

**修正**: 目錄由 `user.profile/` 更名為 `domain.profile/`，所有 import 路徑已同步更新。

**影響範圍**:
- `src/features/account.slice/index.ts`（export 路徑更新）

---

### AC-002 · `account.slice/user.wallet/` → `domain.wallet/`

**違規依據**: §3.1 同上。

**修正**: 目錄由 `user.wallet/` 更名為 `domain.wallet/`，所有 import 路徑已同步更新。

**影響範圍**:
- `src/features/account.slice/index.ts`（export 路徑更新）

---

### AC-003 · `notification-hub.slice/user.notification/` → `domain.notification/`

**違規依據**: §3.1 同上。

**修正**: 目錄由 `user.notification/` 更名為 `domain.notification/`，所有 import 路徑已同步更新。

**影響範圍**:
- `src/features/notification-hub.slice/index.ts`
- `src/features/notification-hub.slice/_services/notification-listener.ts`
- `src/features/notification-hub.slice/_components/notification-bell.tsx`
- `src/features/notification-hub.slice/gov.notification-router/_router.ts`

---

## 待處理項目（Planned）

### AC-004 · `semantic-graph.slice/governance/` → `gov.{name}/`

**違規依據**: §3.1 切片內子領域資料夾使用 `domain.<name>` 或 `gov.<name>`；裸 `governance/` 不符合命名規範。

**現狀**:
```
src/features/semantic-graph.slice/
  governance/         ← 應為 gov.semantic-governance/ 或拆分
    guards/
    semantic-governance-portal/
```

**建議修正**: 依內容語義拆分為：
- `governance/guards/` → `gov.semantic-integrity/`
- `governance/semantic-governance-portal/` → `gov.semantic-portal/`

**預估工作量**: 2-3 人天（含 import 更新與 01-logical-flow.md 路徑修正）

---

### AC-005 · `semantic-graph.slice/{graph,reasoning,routing,learning,output,workflows}/`

**違規依據**: §3.1 切片內子領域資料夾使用 `domain.<name>` 或 `gov.<name>`；裸目錄名不符合規範。§7.2 若屬同一子域，需掛在 `domain.{name}/` 之下。

**現狀**:
```
src/features/semantic-graph.slice/
  graph/              ← 計算引擎（應為 domain.graph-engine/）
  reasoning/          ← 推論引擎（應為 domain.reasoning-engine/）
  routing/            ← 路由引擎（應為 domain.routing-engine/）
  learning/           ← 學習引擎（應為 domain.learning-engine/）
  output/             ← 輸出層（應為 domain.output/ 或拆分）
  workflows/          ← 工作流（應掛在 domain.routing-engine/ 下）
```

**建議修正**:
- `graph/` → `domain.graph-engine/`
- `reasoning/` → `domain.reasoning-engine/`
- `routing/` → `domain.routing-engine/`（`workflows/` 移入其下）
- `learning/` → `domain.learning-engine/`
- `output/` → `domain.output/`

**預估工作量**: 5-8 人天（VS8 最複雜切片，含 01-logical-flow.md 大量路徑修正）

---

### AC-006 · `workforce-scheduling.slice/{application,domain,ports,ui}/`

**違規依據**: §4 Standard Slice Structure；整體結構完全不符合標準，使用了 `application/`、`domain/`、`ports/`、`ui/` 等非標準目錄名。

**現狀**:
```
src/features/workforce-scheduling.slice/
  application/        ← 非標準（應為 domain.{name}/ 或 core/）
  domain/             ← 非標準（裸 domain/ 應改為 domain.{name}/）
  ports/              ← 非標準（應移至 core/ 或依賴倒置到 shared-kernel/ports）
  ui/                 ← 非標準（UI 元件應在 domain.*/  _components/ 或 _hooks/ 下）
  index.ts
```

**建議修正**:
1. 分析 `domain/` 內容，拆分為 `domain.scheduling/`、`domain.conflict/` 等具名子域
2. `application/` 內容整合至 `core/` (command coordinator) 或具名 domain
3. `ports/` 移至 `core/` 內或 `shared-kernel/ports/`
4. `ui/` 元件下沉至對應 `domain.*/  _components/`

**預估工作量**: 5-8 人天

---

### AC-007 · `workspace.slice/application/`

**違規依據**: §3.1 切片內不應存在裸 `application/` 目錄，應整合至 `core/` 或 `domain.{name}/`。

**現狀**:
```
src/features/workspace.slice/
  application/        ← 非標準（Application Coordinator 應在 core/ 下）
  core/               ← 標準 ✓
  core.event-bus/     ← 標準 ✓
  core.event-store/   ← 標準 ✓
  domain.*/           ← 標準 ✓
  gov.*/              ← 標準 ✓
```

**建議修正**: `application/` 內容移至 `core/`（Application Coordinator 本屬核心協調層）。

**預估工作量**: 2-3 人天

---

### AC-008 · `skill-xp.slice/skill-outbox.ts`

**違規依據**: §4 Standard Slice Structure；outbox 屬於 event-store 責任，應放在 `core.event-store/` 下。

**現狀**: `skill-outbox.ts` 位於切片根目錄，未包在任何子域目錄下。

**建議修正**: 移至 `core.event-store/skill-outbox.ts` 或確保 `core.event-store/` 存在後整合。

**預估工作量**: 0.5 人天

---

### AC-009 · `account.slice/acc-outbox.ts`

**違規依據**: §4 同 AC-008。

**建議修正**: 建立 `core.event-store/`，移入 `core.event-store/acc-outbox.ts`。

**預估工作量**: 0.5 人天

---

### AC-010 · `account.slice/account-event-bus.ts`

**違規依據**: §4 Standard Slice Structure；event-bus 屬於 `core.event-bus/` 責任。

**現狀**: `account-event-bus.ts` 位於切片根目錄，未包在 `core.event-bus/` 下。

**建議修正**: 建立 `core.event-bus/`，移入 `core.event-bus/account-event-bus.ts` 並加入 `core.event-bus/index.ts` 公開 API。

**預估工作量**: 0.5 人天

---

## 修正路線圖 / Remediation Roadmap

```
Sprint A（已完成）:
  AC-001: account.slice/user.profile → domain.profile     ✅
  AC-002: account.slice/user.wallet → domain.wallet        ✅
  AC-003: notification-hub.slice/user.notification → domain.notification ✅

Sprint B（高優先 · 低影響）:
  AC-008: skill-xp.slice/skill-outbox.ts → core.event-store/
  AC-009: account.slice/acc-outbox.ts → core.event-store/
  AC-010: account.slice/account-event-bus.ts → core.event-bus/

Sprint C（中優先 · 中影響）:
  AC-007: workspace.slice/application/ → core/
  AC-004: semantic-graph.slice/governance/ → gov.{name}/

Sprint D（複雜 · 需規劃）:
  AC-005: semantic-graph.slice 計算引擎目錄全面重命名
  AC-006: workforce-scheduling.slice 結構全面重建
```

---

## 01-logical-flow.md 路徑更新需求

以下 Mermaid 圖中的路徑參照因上述修正而需同步更新：

| 修正 | 舊路徑 | 新路徑 |
|------|--------|--------|
| AC-001/002 | `src/features/account.slice/user.profile + user.wallet` | `src/features/account.slice/domain.profile + domain.wallet` |
| AC-003 | `account-user.notification` | `domain.notification` |

---

*最後更新: 2026-03-09 | 維護者: Copilot（AC-001~003 已完成；AC-004~010 已規劃）*
