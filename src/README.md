# src — DDD 應用程式根目錄

> **架構基礎**：本目錄依照 `docs/architecture/README.md` 的 L1→L9 層級實作，
> 從 `src-non/` 參考目錄漸進式遷移而來，按照標準 DDD 開發順序建立。

---

## 目錄結構

```
src/
├── shared-kernel/          # L1 · VS0 全域契約中心（DDD Step 1）
├── config/                 # 全域設定常數（DDD Step 2）
├── features/               # L2 領域切片 + L3/L4 基礎設施（DDD Step 3-4）
│   ├── identity.slice/     # VS1  身份驗證、Active Context
│   ├── account.slice/      # VS2  使用者帳號、錢包、政策
│   ├── organization.slice/ # VS3  組織成員、角色、夥伴
│   ├── workspace.slice/    # VS5  工作區任務、工作流程
│   ├── workforce-scheduling.slice/ # VS6 排程提案、指派
│   ├── skill-xp.slice/     # VS7  技能 XP、標籤生命週期
│   ├── notification-hub.slice/ # VS8 推播通知路由、FCM
│   ├── semantic-graph.slice/   # VS9 語義標籤圖、索引搜尋
│   ├── global-search.slice/    # 跨切片語義搜尋 (Cmd+K)
│   ├── portal.slice/           # Portal/Dashboard shell
│   ├── finance.slice/          # 財務領域
│   ├── projection-bus/         # 事件投影 → 讀模型視圖 [L5]
│   ├── observability/          # 指標、錯誤日誌、追蹤 [L9]
│   ├── infra.event-router/     # 整合事件路由 (IER) [L4]
│   ├── infra.gateway-command/  # 命令邊界閘道 (CBG) [L1]
│   ├── infra.gateway-query/    # 查詢閘道 [L6]
│   ├── infra.outbox-relay/     # Outbox 中繼工作者 [R1]
│   ├── infra.dlq-manager/      # 死信佇列管理員 [R5]
│   ├── infra.external-triggers/ # Webhook / Cloud Scheduler 接收
│   └── infra.api-gateway/      # API 閘道適配器
├── shared-infra/           # 真正的基礎設施（Firebase 特定）
│   ├── firebase-admin/     # Cloud Functions (Node.js 套件)
│   └── firebase-client/    # Firestore/Storage 安全規則
├── app/                    # Next.js App Router（DDD Step 5 展示層）
├── app-runtime/            # Context providers、Genkit AI
└── lib-ui/                 # 可重用 UI 元件（shadcn/ui、自訂、DnD）
```

---

## DDD 實作順序（漸進式）

| 步驟 | 層級 | 目錄 | 狀態 |
|------|------|------|------|
| 1 | L1 Shared Kernel | `src/shared-kernel/` | ✅ 完成 |
| 2 | Config | `src/config/` | ✅ 完成 |
| 3 | Domain Slices (VS1–VS9) | `src/features/*.slice/` | ✅ 完成 |
| 4 | Infrastructure | `src/features/infra.*`, `src/shared-infra/` | ✅ 完成 |
| 5 | Presentation | `src/app/`, `src/app-runtime/`, `src/lib-ui/` | ✅ 完成 |

---

## 架構規則

### 依賴方向（單向）

```
Presentation (app/)
  └─> Application (features/*.slice/ → core/)
        └─> Domain (features/*.slice/ → domain.*/)
              └─> Shared Kernel (shared-kernel/)
                    └─> Infrastructure adapters (features/infra.*, shared-infra/)
```

### 匯入規則

| 來源 | 允許匯入 | 禁止匯入 |
|------|---------|---------|
| `features/*.slice/` | `@/shared-kernel`, `@/config`, 同切片私有檔案 | 其他切片的私有檔案 |
| `features/infra.*/` | `@/shared-kernel`, `@/config` | Firebase SDK 直接呼叫 [D24] |
| `shared-kernel/` | 純函式、無副作用 | features, app, runtime |
| `app/` | 所有切片公開 API | 切片私有 `_*` 檔案 |

### `@/*` 路徑別名

`tsconfig.json` 中 `@/*` 對應 `./src/*`。

```typescript
// ✅ 正確
import { AuthContext } from '@/features/identity.slice'
import { SKILL_TIERS } from '@/shared-kernel'

// ❌ 禁止：直接匯入其他切片私有檔案
import { _reducer } from '@/features/workspace.slice/domain.workflow/_reducer'
```

---

## 對應 src-non/

`src-non/` 是原始參考目錄。主要架構差異：

| `src-non/` | `src/` | 差異說明 |
|-----------|--------|---------|
| `src-non/shared-infra/event-router/` | `src/features/infra.event-router/` | 移入 features 層 |
| `src-non/shared-infra/gateway-command/` | `src/features/infra.gateway-command/` | 移入 features 層 |
| `src-non/shared-infra/gateway-query/` | `src/features/infra.gateway-query/` | 移入 features 層 |
| `src-non/shared-infra/outbox-relay/` | `src/features/infra.outbox-relay/` | 移入 features 層 |
| `src-non/shared-infra/dlq-manager/` | `src/features/infra.dlq-manager/` | 移入 features 層 |
| `src-non/shared-infra/external-triggers/` | `src/features/infra.external-triggers/` | 移入 features 層 |
| `src-non/shared-infra/projection-bus/` | `src/features/projection-bus/` | 移入 features 層 |
| `src-non/shared-infra/observability/` | `src/features/observability/` | 移入 features 層 |
| `src-non/shared-infra/api-gateway/` | `src/features/infra.api-gateway/` | 移入 features 層 |
| `src-non/shared-infra/firebase-admin/` | `src/shared-infra/firebase-admin/` | 保留（真實基礎設施） |
| `src-non/shared-infra/firebase-client/` | `src/shared-infra/firebase-client/` | 保留（真實基礎設施） |

---

## 相關文件

- 架構 SSOT：`docs/architecture/README.md`
- 領域模型：`docs/architecture/models/domain-model.md`
- 契約規格：`docs/architecture/specs/contract-spec.md`
- 應用服務：`docs/architecture/blueprints/application-service-spec.md`
- 基礎設施：`docs/architecture/guidelines/infrastructure-spec.md`
- 切片自治規則：`src/features/README.md`
- 共用核心規則：`src/shared-kernel/README.md`
