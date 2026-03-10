# 00 Architecture Standards

> Status: Active
> Scope: `src/features/*`, `src/app/*`, `src/shared-kernel/*`, `src/shared-infra/*`
> Purpose: 統一垂直功能切片與 Next.js App Router（含平行路由）命名與目錄結構，降低維護與協作成本。

## 1. Goals

- 消除同語義不同命名（檔名、資料夾名、層級位置不一致）。
- 讓新功能可以直接依照標準範本建立，不再每個切片各自發明。
- 對齊 `docs/architecture/00-logic-overview.md` 的層級與邊界。

## 2. Core Principles

- Single meaning, single name：同一責任在全專案只能有一種命名。
- Private by default：切片內部實作預設私有，僅由 `index.ts` 對外公開。
- Route thinness：`src/app` 只做路由與布局組裝，不放業務邏輯。
- Layer authority：讀寫與基礎設施責任遵循 L0-L10，不跨層偷渡。

## 3. Global Naming Rules

### 3.1 Directory Naming

- 使用 `kebab-case`。
- 功能切片根目錄必須為 `{feature}.slice`。
- 切片內子領域資料夾使用 `domain.<name>` 或 `gov.<name>`。
- Core 區域固定使用：`core`、`core.event-bus`、`core.event-store`。
- 禁止同時存在語義重疊目錄，例如 `business.daily` 與 `daily.business`。

Examples:

- `workspace.slice`
- `domain.files`
- `gov.members`
- `core.event-bus`

### 3.2 File Naming

- 使用 `kebab-case`（檔名主體）。
- 切片私有檔案以 `_` 開頭。
- 切片公開入口固定為 `index.ts`。
- 測試檔固定為 `*.test.ts` 或 `*.test.tsx`。

Canonical private filenames:

- `_actions.ts`
- `_queries.ts`
- `_services.ts`
- `_types.ts`
- `_constants.ts`
- `_aggregate.ts`
- `_projector.ts`
- `_events.ts`（事件定義）

Canonical private folders:

- `_components/`
- `_hooks/`
- `_queries/`（當 query 檔案超過 3 個時）
- `_services/`（當 service 檔案超過 3 個時）

### 3.3 Prohibited Mixed Patterns

下列命名混用禁止在新代碼出現：

- `_actions.ts` 與 `*.actions.ts` 並存。
- `_queries.ts` 與 `*.query.ts`/`*.queries.ts` 無規則混用。
- 同一責任同時存在 `core.*` 與 `business.*` 但沒有明確邊界。

## 4. Standard Slice Structure

每個 `*.slice` 必須遵循此最小結構。

```text
src/features/{feature}.slice/
	index.ts
	_types.ts
	_actions.ts
	_queries.ts
	_services.ts

	core/
		_aggregate.ts
		_projector.ts

	core.event-bus/
		_events.ts
		index.ts

	core.event-store/
		_store.ts
		index.ts

	domain.{subdomain}/
		index.ts
		_types.ts
		_actions.ts
		_queries.ts
		_services.ts
		_components/
		_hooks/

	gov.{subdomain}/
		index.ts
		_types.ts
		_actions.ts
		_queries.ts
		_components/
		_hooks/
```

### 4.1 Public Export Contract

- `index.ts` 是切片唯一公開 API。
- 禁止跨切片 import 私有檔案（`_` 開頭或私有資料夾）。
- `src/app` 只能 import 切片的 `index.ts`。

## 5. Next.js App Router and Parallel Routes Standards

### 5.1 Route Group Naming

- Route group 使用 `(kebab-case)`：例如 `(portal)`、`(public)`。
- Parallel route slot 使用 `@kebabcase`：例如 `@modal`、`@sidebar`、`@panel`。
- Intercept route 使用 `(.)segment`，只用於 modal/panel overlay 場景。

### 5.2 Route File Conventions

- 每個 segment 可用檔名僅限：`page.tsx`、`layout.tsx`、`loading.tsx`、`error.tsx`、`default.tsx`。
- `default.tsx` 僅用於 parallel route slot。
- 路由檔案禁止放業務邏輯，僅組裝 feature 元件與資料存取入口。

### 5.3 Standard Parallel Route Template

```text
src/app/(shell)/(portal)/(account)/(workspaces)/workspaces/[id]/
	layout.tsx
	page.tsx
	loading.tsx
	error.tsx

	@modal/
		default.tsx
		(.)settings/page.tsx

	@panel/
		default.tsx
		(.)governance/page.tsx

	@businesstab/
		default.tsx
		loading.tsx
		tasks/page.tsx
		tasks/loading.tsx
		schedule/page.tsx
		schedule/loading.tsx
		files/page.tsx
		files/loading.tsx
```

## 6. Mapping Standards to Layers

### 6.1 Vertical Slice Index（VS1~VS9）

- VS1: Identity
- VS2: Account
- VS3: Skill
- VS4: Organization
- VS5: Workspace
- VS6: Scheduling
- VS7: Notification
- VS8: Semantic Brain
- VS9: Finance

- `src/app/*`：L0 入口層（路由與布局）
- `src/features/*.slice/*`：L3 領域切片
- `src/shared-kernel/*`：L1 契約與純函式
- `src/shared-infra/*`：L0/L2/L4/L5/L6/L7/L9/L10 執行層

補充：L8 為 Firebase 外部平台執行層，不對應本地 feature slice 目錄。

## 7. Migration Rules (Legacy to Standard)

### 7.1 File Rename Rules

- `*.actions.ts` -> `_actions.ts`
- `*.queries.ts` 或 `*.query.ts`（切片入口用途）-> `_queries.ts`
- `*.service.ts` 或 `*.services.ts`（切片入口用途）-> `_services.ts`
- `types.ts`（私有）-> `_types.ts`

### 7.2 Folder Normalize Rules

- `business.*` 統一更名為 `domain.*`
- `infra.outbox` 保留，但僅作為 outbox 寫入契約區
- `workflows/`、`routing/`、`reasoning/` 若屬同一子域，需掛在 `domain.{name}/` 之下

### 7.3 Safe Migration Sequence

1. 建立 `index.ts` 公開 API，先穩定對外引用面。
2. 只改一個切片，完成後跑 typecheck/lint/test。
3. 以 re-export 暫時相容舊路徑，最後一次清除。

## 8. New Slice Bootstrap Template

建立新切片時，直接複製以下模板。

```text
src/features/{new-feature}.slice/
	index.ts
	_types.ts
	_actions.ts
	_queries.ts
	_services.ts
	_components/
	_hooks/

	core/
		_aggregate.ts
		_projector.ts

	core.event-bus/
		_events.ts
		index.ts

	domain.main/
		index.ts
		_types.ts
		_actions.ts
		_queries.ts
		_components/
		_hooks/

	gov.policy/
		index.ts
		_types.ts
		_actions.ts
		_queries.ts
```

## 9. PR Review Checklist (Architecture Standards)

- 切片根目錄是否使用 `{feature}.slice`。
- 是否存在未經 `index.ts` 暴露的跨切片私有 import。
- 是否同時出現 `_actions.ts` 與 `*.actions.ts` 混用。
- `src/app` 是否只保留路由組裝，無業務邏輯。
- 平行路由 slot 是否具備 `default.tsx`。

## 10. Versioning

- 本文件為命名與目錄規格基準文件。
- 若與其他說明文衝突，以本文件與 `00-logic-overview.md` 共同裁決。

---

## 11. AI Agent Three-Phase Scan Guide（三位一體掃描指南）

本節描述 **Xuanwu 架構守護者（`x-framework-guardian`）** 的標準使用流程。判斷標準**僅限於**本文件（`00-architecture-standards.md`）與 `01-logical-flow.md`；未在這兩份文件中定義的結構，一律視為合規。

---

### 第一階段：初始化與對準 (Setup & Alignment)

在執行任何掃描前，必須先餵入法律條文，以防止 Agent 依賴通用 AI 知識推斷。

**初始化系統提示（建議複製並使用）：**

```text
請讀取並索引專案中的 docs/architecture/00-architecture-standards.md 與 docs/architecture/01-logical-flow.md。
從現在起，你扮演 Xuanwu 架構守護者。你的所有判斷標準「僅限於」這兩份文件。
若代碼違反規範，請指出具體條款（如 §3.1 或 L3 層位）；若文件未定義，則視為合規。
請確認你已準備好執行「三位一體」掃描。
```

---

### 第二階段：執行審計 (Execution)

#### 2-1. 全量對準 (Full Alignment)

```text
Run Audit. Compare the current codebase with 00-architecture-standards.md and 01-logical-flow.md.
Please provide the Drift Report and Compliance Status.
```

**輸出格式**：Physical Audit 表、Boundary Audit 表、Flow Audit 表、Auto-Fix 指令、Compliance Status 健康分。

#### 2-2. 邊界巡邏 (Boundary Audit)

```text
執行 Boundary Audit。檢查 src/features/ 下是否有檔案直接 import 其他切片的內部路徑
（如 domain.* 或 _ 開頭檔案），而非透過 index.ts。請列出違規行號與重構建議。
```

**對照條款**：§4.1 Public Export Contract。

#### 2-3. 清理舊債 (Migration Audit)

```text
根據 00-architecture-standards.md §7 的遷移規則，列出所有舊版命名的檔案
（如 *.actions.ts 或 business.* 目錄），並直接生成 git mv 修正指令。
```

**對照條款**：§7.1 File Rename Rules、§7.2 Folder Normalize Rules。

---

### 第三階段：開發輔助 (Development Support)

#### 3-1. 建立新 Slice

```text
依照 §8 的 Bootstrap Template，為我生成一個名為 {feature-name} 的新切片（Slice）目錄結構。
確保包含 index.ts 以及私有的 _ 開頭檔案。
```

**對照條款**：§8 New Slice Bootstrap Template、§3.1 Directory Naming、§3.2 File Naming。

#### 3-2. 邏輯鏈驗證

```text
追蹤 src/features/{feature}.slice 的邏輯流向。
它是否嚴格遵守 01-logical-flow.md 定義的 L0 -> L3 -> L4 -> L5 流程？
特別檢查是否有 Command 流程直接回傳大量 Query Data 的違規。
```

**對照條款**：`01-logical-flow.md` § 三條主鏈、§ 合規規則集。

---

### 三位一體輸出範本

```markdown
## Drift Report — [日期 / PR / Commit]

### Physical Audit（§3、§4、§7）
| 違規 ID | 類型 | 路徑 | 條款 | 說明 |
|--------|------|------|------|------|

### Boundary Audit（§4.1）
| 違規 ID | 類型 | 位置 | 違規 import | 說明 |
|--------|------|------|------------|------|

### Flow Audit（01-logical-flow.md）
| 違規 ID | 類型 | 位置 | 違反層位 | 說明 |
|--------|------|------|---------|------|

## Auto-Fix
\`\`\`bash
# Physical Audit
git mv ...
# Boundary Audit 重構
# Flow Audit 重構
\`\`\`

## Compliance Status
| 審計維度 | 違規數 | 健康分 |
|---------|-------|-------|
| Physical | N | /100 |
| Boundary | N | /100 |
| Flow | N | /100 |
| **總體** | | **/100** |
```

> ✅ 健康分 ≥ 90：HEALTHY — 可合入主幹  
> ⚠️ 健康分 70–89：NEEDS ATTENTION — 高嚴重度項目必須修復後才可合入  
> 🚨 健康分 < 70：CRITICAL DRIFT — 阻斷合入，必須先完成架構修復

