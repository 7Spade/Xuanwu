# Phase 1: Pre-conversion Inventory (轉換前盤點)

> **Document Type**: Phase Documentation  
> **Phase**: 1 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Next Phase**: [Phase 2: Next.js Architecture Analysis](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md)

---

## 目標 (Objectives)

在開始 Next.js 到 Angular 轉換之前，建立完整的基準線 (baseline) 和盤點清單，確保:

1. **明確轉換範圍** - 確認所有需要轉換的功能和頁面
2. **建立行為基準** - 記錄現有系統的可觀察行為作為驗證標準
3. **識別技術債務** - 了解現有架構的限制和問題
4. **規劃轉換策略** - 基於盤點結果制定轉換優先順序

---

## 1. 轉換目標確認 (Conversion Targets Confirmation)

### 1.1 Angular 目標版本與架構

✅ **已確認配置:**

| 項目 | Next.js (源) | Angular (目標) | 狀態 |
|------|-------------|---------------|------|
| **框架版本** | Next.js 14.x (Pages Router) | Angular 21.1.3 | ✅ 已完成 |
| **架構模式** | React Components + Pages Router | Standalone Components | ✅ 已完成 |
| **狀態管理** | Zustand | Signals | ✅ 已完成 |
| **SSR 支援** | Next.js SSR (getServerSideProps) | Angular Universal (@angular/ssr) | ✅ 已完成 |
| **SSG 支援** | getStaticProps, ISR | Prerender + Revalidation | ✅ 已完成 |
| **路由系統** | File-based Routing (pages/) | Angular Router (Declarative) | ✅ 已完成 |
| **樣式系統** | Tailwind CSS + CSS Modules | Tailwind CSS 4.1.12 | ✅ 已完成 |
| **變更檢測** | React useState/useEffect | Zoneless + ChangeDetectionStrategy.OnPush | ✅ 已完成 |
| **資料獲取** | getServerSideProps, fetch hooks | Resolvers + HttpClient + Signals | ✅ 已完成 |

**關鍵決策記錄:**
- ✅ 採用 **Standalone Components** (Angular 20+ 預設，無 NgModule)
- ✅ 採用 **Signals** 作為主要狀態管理機制
- ✅ 啟用 **Zoneless** 變更檢測 (`provideZonelessChangeDetection`)
- ✅ 所有組件使用 **OnPush** 變更檢測策略
- ✅ SSR 優先 (與 Next.js 行為等價)
- ✅ 保留 Tailwind CSS (版本升級至 4.1.12)
- ✅ 完整支援現有 Firebase 整合

### 1.2 轉換範圍定義

**包含範圍:**
- ✅ 所有頁面組件 (31 pages)
- ✅ 所有共享組件 (40+ components)
- ✅ 所有 UI 組件 (35+ ShadCN components)
- ✅ 所有自定義 hooks → Angular services
- ✅ 所有 Firebase hooks → Angular Firebase services
- ✅ 狀態管理 (Zustand → Signals)
- ✅ 路由系統
- ✅ 認證流程
- ✅ SEO/Meta 標籤

**不包含範圍:**
- ❌ AI flows (保留在原 Genkit 系統，未來可能遷移)
- ❌ API routes (由 Firebase Functions 處理)

---

## 2. 路由盤點 (Route Inventory)

### 2.1 頁面路由清單 (Page Routes)

基於 Next.js App Router 文件結構，共識別 **24 個獨立頁面路由**:

| # | Next.js 路徑 | Angular 路由 | 頁面類型 | 渲染策略 | 狀態 |
|---|-------------|-------------|---------|---------|------|
| 1 | `/` | `''` | Landing Page | CSR | ✅ |
| 2 | `/login` | `login` | Auth Page | CSR | ✅ |
| 3 | `/dashboard` | `dashboard` | Dashboard Home | SSR/CSR | ✅ |
| 4 | `/dashboard/blocks` | `dashboard/blocks` | Resource Blocks | CSR | ✅ |
| 5 | `/dashboard/settings` | `dashboard/settings` | User Settings | CSR | ✅ |
| 6 | `/dashboard/team` | `dashboard/team` | Team Management | CSR | ✅ |
| 7 | `/dashboard/organization/audit` | `dashboard/organization/audit` | Audit Logs | CSR | ✅ |
| 8 | `/dashboard/organization/daily` | `dashboard/organization/daily` | Daily Logs | CSR | ✅ |
| 9 | `/dashboard/organization/external` | `dashboard/organization/external` | External Gateway | CSR | ✅ |
| 10 | `/dashboard/organization/matrix` | `dashboard/organization/matrix` | Permission Matrix | CSR | ✅ |
| 11 | `/dashboard/organization/members` | `dashboard/organization/members` | Organization Members | CSR | ✅ |
| 12 | `/dashboard/organization/partners` | `dashboard/organization/partners` | Partners List | CSR | ✅ |
| 13 | `/dashboard/organization/partners/[id]` | `dashboard/organization/partners/:id` | Partner Detail | CSR | ✅ |
| 14 | `/dashboard/organization/schedule` | `dashboard/organization/schedule` | Schedule | CSR | ✅ |
| 15 | `/dashboard/organization/settings` | `dashboard/organization/settings` | Organization Settings | CSR | ✅ |
| 16 | `/dashboard/organization/teams` | `dashboard/organization/teams` | Teams List | CSR | ✅ |
| 17 | `/dashboard/organization/teams/[id]` | `dashboard/organization/teams/:id` | Team Detail | CSR | ✅ |
| 18 | `/dashboard/workspaces` | `dashboard/workspaces` | Workspaces List | CSR | ✅ |
| 19 | `/dashboard/workspaces/[id]` | `dashboard/workspaces/:id` | Workspace Detail | CSR | ✅ |
| 20 | `/dashboard/workspaces/blocks` | `dashboard/workspaces/blocks` | Workspace Blocks | CSR | ✅ |
| 21 | `/dashboard/workspaces/capabilities` | `dashboard/workspaces/capabilities` | Capabilities | CSR | ✅ |

### 2.2 動態路由識別 (Dynamic Routes)

**動態路由模式對映:**

| Next.js 模式 | Angular 路由參數 | 參數類型 | 範例 |
|-------------|---------------|---------|------|
| `[id]` | `:id` | Single Segment | `/workspaces/:id` |
| `teams/[id]` | `teams/:id` | Nested Dynamic | `/organization/teams/:id` |
| `partners/[id]` | `partners/:id` | Nested Dynamic | `/organization/partners/:id` |

**動態路由總數:** 3 個主要動態路由

### 2.3 佈局系統 (Layouts)

| Next.js Layout | Angular 等價 | 描述 |
|---------------|-------------|------|
| `app/layout.tsx` | Root `AppComponent` + Router Outlet | 根佈局 |
| `app/dashboard/layout.tsx` | Dashboard Layout Component | Dashboard 共享佈局 (sidebar, header) |

---

## 3. Middleware 與守衛盤點 (Middleware Catalog)

### 3.1 Next.js Middleware

**Next.js 未使用 middleware.ts**

基於 repomix 分析，Next.js 專案**未實作 middleware.ts**，而是使用:
- Client-side auth checks in components
- Firebase Auth state listeners

### 3.2 Angular 守衛策略 (Angular Guards Strategy)

**轉換對映:**

| Next.js 模式 | Angular 守衛 | 用途 |
|-------------|------------|------|
| Client auth check | `AuthGuard` (CanActivate) | 路由保護 |
| User state check | `UserGuard` (CanActivate) | 用戶狀態驗證 |
| Organization check | `OrgGuard` (CanActivate) | 組織權限檢查 |

**實作位置:**
- `src/app/core/guards/auth.guard.ts`
- `src/app/core/guards/user.guard.ts`
- `src/app/core/guards/org.guard.ts`

---

## 4. API Routes 盤點 (API Routes Catalog)

### 4.1 Next.js API Routes

**Next.js 專案使用 Firebase 直接存取模式:**

| 資料源 | Next.js 模式 | Angular 模式 |
|--------|------------|-------------|
| Firestore | Direct Firebase SDK + Hooks | Firebase Service + Signals |
| Firebase Auth | Direct Firebase Auth | Firebase Auth Service |
| Storage | (未使用) | - |

**無傳統 API Routes (`/api/*`)**

### 4.2 Firebase Functions (Server-side)

**Firebase Functions 作為後端 API:**
- 部署在 Firebase Functions
- 前端透過 Firebase SDK 呼叫
- Angular 保持相同整合模式

---

## 5. 環境變數盤點 (Environment Variables)

### 5.1 Next.js 環境變數

**Next.js 環境變數模式:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 5.2 Angular 環境配置

**Angular 環境配置策略:**

| Next.js | Angular | 位置 |
|---------|---------|------|
| `NEXT_PUBLIC_*` | `environment.ts` | `src/environments/environment.ts` |
| `.env.local` | `environment.development.ts` | `src/environments/environment.development.ts` |
| `.env.production` | `environment.ts` | `src/environments/environment.ts` |

**配置文件:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: 'xxx',
    authDomain: 'xxx',
    projectId: 'xxx',
    storageBucket: 'xxx',
    messagingSenderId: 'xxx',
    appId: 'xxx'
  }
};
```

---

## 6. 資料模型盤點 (Data Models Inventory)

### 6.1 Firestore Collections

基於 `backend.json` 分析:

| Collection | 文件結構 | 用途 |
|-----------|---------|------|
| `organizations` | Organization | 組織主資料 |
| `workspaces` | Workspace | 工作空間 |
| `partnerInvites` | PartnerInvite | 合作夥伴邀請 |
| `users` | User | 用戶資料 |

**TypeScript 類型定義位置:**
- Next.js: `src/types/domain.ts`
- Angular: `src/app/shared-kernel/domain/models/*.ts`

### 6.2 狀態管理模型

**Zustand Store → Angular Signals 對映:**

| Zustand Store | Angular Service | 狀態類型 |
|--------------|----------------|---------|
| `useAppStore` | `AppStateService` | Global State (Signals) |
| Auth state | `AuthService` | Auth State (Signals) |
| Organization state | `OrganizationService` | Feature State |
| Workspace state | `WorkspaceService` | Feature State |

---

## 7. 行為基準建立 (Behavior Baseline)

### 7.1 關鍵使用者流程 (Critical User Flows)

**需驗證的關鍵流程:**

1. **認證流程 (Authentication Flow)**
   - ✅ Google Sign-In
   - ✅ Email/Password Sign-In
   - ✅ Session persistence
   - ✅ Auto-redirect after login

2. **組織管理流程 (Organization Management)**
   - ✅ Create organization
   - ✅ Switch organization
   - ✅ Invite members
   - ✅ Manage teams

3. **工作空間流程 (Workspace Flow)**
   - ✅ Create workspace
   - ✅ View workspace details
   - ✅ Manage workspace members
   - ✅ Workspace capabilities

4. **導航流程 (Navigation Flow)**
   - ✅ Dashboard navigation
   - ✅ Sidebar navigation
   - ✅ Breadcrumb navigation
   - ✅ Back/Forward browser behavior

### 7.2 SEO 與 Meta 標籤基準

**Next.js Meta 標籤策略:**

| 頁面 | Title | Description | OG Tags |
|-----|-------|------------|---------|
| Landing | "OrgVerse - Multi-dimensional Identity Platform" | "..." | ✅ |
| Dashboard | "Dashboard - OrgVerse" | "..." | ✅ |
| Login | "Login - OrgVerse" | "..." | ✅ |

**Angular Meta 服務實作:**
- `Title` service (Angular Router)
- `Meta` service (Angular platform-browser)
- Server-side meta tag injection (SSR)

### 7.3 效能基準 (Performance Baseline)

**Next.js 效能指標 (參考):**

| 指標 | Next.js | Angular 目標 |
|-----|---------|------------|
| First Contentful Paint (FCP) | < 1.8s | < 1.8s |
| Largest Contentful Paint (LCP) | < 2.5s | < 2.5s |
| Time to Interactive (TTI) | < 3.8s | < 3.8s |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.1 |
| First Input Delay (FID) | < 100ms | < 100ms |

---

## 8. 技術債務與風險識別 (Technical Debt & Risks)

### 8.1 Next.js 已知問題

**從 Next.js 專案識別的技術債:**

1. **State Management**
   - ⚠️ Zustand 全域狀態可能過度集中
   - ⚠️ 部分組件直接存取 Firestore (未透過統一服務)

2. **Type Safety**
   - ⚠️ 部分 Firebase 回傳值使用 `any`
   - ⚠️ 事件處理器缺少完整類型

3. **Error Handling**
   - ⚠️ 錯誤邊界未完整實作
   - ⚠️ Firebase 錯誤未統一處理

### 8.2 Angular 轉換風險

**高風險項目:**

1. **SSR Hydration**
   - 🔴 Risk: Signals 在 SSR 與 CSR 間的狀態同步
   - ✅ Mitigation: 使用 TransferState API

2. **Firebase 整合**
   - 🟡 Risk: Firebase SDK 在 SSR 環境的行為差異
   - ✅ Mitigation: isPlatformBrowser 檢查 + afterNextRender

3. **狀態遷移**
   - 🟡 Risk: Zustand 複雜狀態邏輯轉換為 Signals
   - ✅ Mitigation: 逐步遷移 + 完整測試

---

## 9. 工具與資源清單 (Tools & Resources)

### 9.1 開發工具

| 工具 | 用途 | Next.js 版本 | Angular 版本 |
|-----|------|------------|------------|
| Package Manager | 依賴管理 | npm | npm 11.6.2 |
| Linter | 程式碼檢查 | ESLint | ESLint + Angular ESLint |
| Formatter | 程式碼格式化 | Prettier | Prettier 3.8.1 |
| Testing | 測試 | Jest (未實作) | Vitest 4.0.8 |
| Build Tool | 建置 | Next.js | Angular CLI 21.1.2 |

### 9.2 文件資源

**既有文件:**
- ✅ [Next.js Migration Guide](./docs/NEXTJS_TO_ANGULAR_MIGRATION.md)
- ✅ [Implementation Guide](./docs/NEXTJS_TO_ANGULAR_IMPLEMENTATION_GUIDE.md)
- ✅ [Project Tree](./docs/NEXTJS_PROJECT_TREE.md)
- ✅ [Function Reference](./docs/NEXTJS_FUNCTION_REFERENCE.md)
- ✅ [Naming Audit](./docs/NEXTJS_NAMING_AUDIT.md)

**Angular 規範:**
- ✅ [Angular 20 + SSR + Less Zero 規範](../../ANGULAR20_SSR_LESSZERO_SPEC.md)
- ✅ [DDD Layer Boundaries](../../DDD_LAYER_BOUNDARIES.md)
- ✅ [Naming Conventions](../../NAMING_CONVENTIONS.md)

---

## 10. Phase 1 完成檢查清單 (Completion Checklist)

### 10.1 轉換目標確認
- ✅ Angular 版本確認 (21.1.3)
- ✅ 架構模式確認 (Standalone + Signals + Zoneless)
- ✅ SSR 策略確認 (Angular Universal)
- ✅ 轉換範圍定義完成

### 10.2 盤點清單完成
- ✅ 路由盤點 (24 個頁面 + 3 個動態路由)
- ✅ Middleware/守衛對映
- ✅ API 策略確認 (Firebase 直接整合)
- ✅ 環境變數對映
- ✅ 資料模型盤點

### 10.3 基準建立
- ✅ 關鍵使用者流程定義
- ✅ SEO 基準建立
- ✅ 效能基準定義
- ✅ 技術債務識別

### 10.4 文件與資源
- ✅ 工具清單建立
- ✅ 文件資源整理
- ✅ Phase 1 文件完成

---

## 11. 下一步行動 (Next Actions)

**進入 Phase 2: Next.js Architecture Analysis**

Phase 2 將深入分析:
1. 每個路由的渲染策略 (SSR/SSG/CSR)
2. 資料獲取模式 (hooks, direct calls, state)
3. 狀態管理架構 (Zustand 詳細分析)
4. 組件層次與依賴關係

**前往:** [Phase 2: Next.js Architecture Analysis](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md)

---

## 附錄 (Appendix)

### A. 完整路由樹 (Complete Route Tree)

```
/                               Landing Page (CSR)
/login                          Login Page (CSR)
/dashboard                      Dashboard Home (SSR/CSR)
  /blocks                       Resource Blocks
  /settings                     User Settings
  /team                         Team Management
  /organization
    /audit                      Audit Logs
    /daily                      Daily Logs
    /external                   External Gateway
    /matrix                     Permission Matrix
    /members                    Organization Members
    /partners                   Partners List
      /[id]                     Partner Detail (Dynamic)
    /schedule                   Schedule
    /settings                   Organization Settings
    /teams                      Teams List
      /[id]                     Team Detail (Dynamic)
  /workspaces                   Workspaces List
    /[id]                       Workspace Detail (Dynamic)
    /blocks                     Workspace Blocks
    /capabilities               Capabilities
```

### B. 核心依賴版本對照

| 依賴 | Next.js | Angular |
|-----|---------|---------|
| React / Angular | 18.x | 21.1.3 |
| Firebase | 10.x | 12.8.0 |
| Tailwind | 3.x | 4.1.12 |
| TypeScript | 5.x | 5.9.3 |

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)
- [→ Phase 2: Next.js Architecture Analysis](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md)
