# 00 Architecture Standards

> Status: Active
> Scope: `src/features/*`, `src/app/*`, `src/shared-kernel/*`, `src/shared-infra/*`
> Purpose: 只定義「命名規則 + 結構範本」。

## 1. Core Rules

- Single meaning, single name: 同一責任只允許一種命名。
- Private by default: 私有實作預設不外露，僅 `index.ts` 對外。
- Route thinness: `src/app` 只做路由與組裝，不承載業務邏輯。
- Layer alignment: 目錄歸屬需對齊 `00-logic-overview.md` 的 L0-L10。

## 2. Naming Rules

### 2.1 Directories

- 一律 `kebab-case`。
- Feature root 必須是 `{feature}.slice`。
- 子域命名使用 `domain.<name>`、`gov.<name>`。
- 核心區固定名稱：`core`、`core.event-bus`、`core.event-store`。

### 2.2 Files

- 一律 `kebab-case`。
- 私有檔案使用 `_` 前綴。
- 公開 API 固定檔名 `index.ts`。
- 測試固定 `*.test.ts` / `*.test.tsx`。

Canonical private filenames:

- `_actions.ts`
- `_queries.ts`
- `_services.ts`
- `_types.ts`
- `_constants.ts`
- `_aggregate.ts`
- `_projector.ts`
- `_events.ts`

Canonical private folders:

- `_components/`
- `_hooks/`
- `_queries/` (query > 3 files)
- `_services/` (service > 3 files)

### 2.3 Forbidden Naming Mix

- `_actions.ts` 與 `*.actions.ts` 並存。
- `_queries.ts` 與 `*.query.ts` / `*.queries.ts` 混用。
- `core.*` 與 `business.*` 承載同一責任。

## 3. Standard Slice Template

每個 `*.slice` 依此最小模板建立：

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

Public API contract:

- `index.ts` 是切片唯一對外入口。
- 禁止跨切片 import 私有檔（`_*.ts`、私有資料夾）。
- `src/app` 僅可 import 切片 `index.ts`。

## 4. App Router Template

Route 命名：

- route group: `(kebab-case)`
- parallel slot: `@kebabcase`
- intercept: `(.)segment`

可用檔名：`page.tsx`、`layout.tsx`、`loading.tsx`、`error.tsx`、`default.tsx`。

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
```

## 5. Layer Mapping (Quick)

- `src/app/*` -> L0
- `src/features/*.slice/*` -> L3
- `src/shared-kernel/*` -> L1
- `src/shared-infra/*` -> L0/L2/L4/L5/L6/L7/L9/L10
- L8 為外部 Firebase runtime（非本地目錄）

Vertical slice index:

- VS1 Identity
- VS2 Account
- VS3 Skill
- VS4 Organization
- VS5 Workspace
- VS6 Scheduling
- VS7 Notification
- VS8 Semantic Brain
- VS9 Finance

## 6. Migration Rules

Rename rules:

- `*.actions.ts` -> `_actions.ts`
- `*.queries.ts` / `*.query.ts` -> `_queries.ts`
- `*.service.ts` / `*.services.ts` -> `_services.ts`
- `types.ts` (private) -> `_types.ts`

Folder normalize rules:

- `business.*` -> `domain.*`
- `workflows/`, `routing/`, `reasoning/` 按責任歸入 `domain.{name}/`

Safe sequence:

1. 先補 `index.ts` 公開 API。
2. 每次只遷移一個 slice。
3. 完成後跑 lint/typecheck/test。

## 7. Review Checklist

- 切片根目錄是否為 `{feature}.slice`。
- 是否存在跨切片私有 import。
- 是否存在 `_actions.ts` 與 `*.actions.ts` 混用。
- `src/app` 是否維持 thin route。
- parallel slot 是否具備 `default.tsx`。

## 8. Conflict Resolution

若與其他架構文件衝突，依 `00-index.md` 指定優先序裁決：`00 > 02 > 03 > 01`。

