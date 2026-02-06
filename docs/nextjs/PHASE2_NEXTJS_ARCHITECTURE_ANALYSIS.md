# Phase 2: Next.js Architecture Analysis (架構與行為解析)

> **Document Type**: Phase Documentation  
> **Phase**: 2 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Previous**: [Phase 1: Pre-conversion Inventory](./PHASE1_PRE_CONVERSION_INVENTORY.md) | **Next**: [Phase 3: Angular Target Architecture](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md)

---

## 目標 (Objectives)

深入分析 Next.js 專案的架構模式、資料流動和狀態管理，為 Angular 轉換提供詳細的技術對映基礎：

1. **路由渲染策略分析** - 識別每個路由的 SSR/SSG/ISR/CSR 模式
2. **資料獲取模式分析** - 分類資料來源和獲取方式
3. **狀態管理架構分析** - 深入理解 Zustand store 設計
4. **組件層次分析** - 了解組件依賴和資料流向

---

## 1. 路由與渲染策略盤點 (Routing & Rendering Strategy)

### 1.1 渲染策略總覽

基於 Next.js Pages Router 分析，專案使用以下渲染策略:

| 渲染模式 | 頁面數量 | 使用場景 |
|---------|---------|---------|
| **CSR (Client-Side Rendering)** | 24 | 所有頁面 (無 SSR/SSG) |
| **SSR (getServerSideProps)** | 0 | 未使用 |
| **SSG (getStaticProps)** | 0 | 未使用 |
| **ISR (Incremental Static Regeneration)** | 0 | 未使用 |

**關鍵發現:**
- ✅ 所有頁面使用純 CSR (Client-Side Rendering)
- ✅ 資料透過 Firebase SDK 在客戶端獲取
- ✅ 使用 Firebase Auth state listener 進行認證
- ⚠️ 無預渲染頁面，SEO 依賴 client-side meta tags

### 1.2 逐頁渲染策略分析

| 路由 | 渲染模式 | 資料來源 | Auth Required | SEO Critical |
|------|---------|---------|--------------|-------------|
| `/` | CSR | Static | ❌ | ✅ High |
| `/login` | CSR | Firebase Auth | ❌ | ❌ Low |
| `/dashboard` | CSR | Firestore (orgs, workspaces) | ✅ | ❌ Low |
| `/dashboard/blocks` | CSR | Zustand Store | ✅ | ❌ Low |
| `/dashboard/organization/settings` | CSR | Firestore (org) | ✅ | ❌ Low |
| `/dashboard/organization/members` | CSR | Firestore (org members) | ✅ | ❌ Low |
| `/dashboard/organization/teams` | CSR | Firestore (teams) | ✅ | ❌ Low |
| `/dashboard/organization/teams/[id]` | CSR | Firestore (team) | ✅ | ❌ Low |
| `/dashboard/organization/partners` | CSR | Firestore (partners) | ✅ | ❌ Low |
| `/dashboard/organization/partners/[id]` | CSR | Firestore (partner) | ✅ | ❌ Low |
| `/dashboard/organization/audit` | CSR | Zustand Store | ✅ | ❌ Low |
| `/dashboard/organization/daily` | CSR | Zustand Store | ✅ | ❌ Low |
| `/dashboard/organization/external` | CSR | Firestore (orgs) | ✅ | ❌ Low |
| `/dashboard/organization/matrix` | CSR | Firestore (permissions) | ✅ | ❌ Low |
| `/dashboard/organization/schedule` | CSR | Firestore (schedules) | ✅ | ❌ Low |
| `/dashboard/workspaces` | CSR | Firestore (workspaces) | ✅ | ❌ Low |
| `/dashboard/workspaces/[id]` | CSR | Firestore (workspace) | ✅ | ❌ Low |
| `/dashboard/workspaces/blocks` | CSR | Zustand Store | ✅ | ❌ Low |
| `/dashboard/workspaces/capabilities` | CSR | Zustand Store | ✅ | ❌ Low |
| `/dashboard/settings` | CSR | Firebase Auth | ✅ | ❌ Low |
| `/dashboard/team` | CSR | Firestore (org members) | ✅ | ❌ Low |

**Angular SSR 建議:**
- 🟢 Landing Page (`/`) - 建議 SSR + Prerender (SEO critical)
- 🟢 Login (`/login`) - 建議 Prerender (提升首次載入)
- 🟡 Dashboard (`/dashboard`) - 建議 SSR (改善 TTFB)
- 🔵 其他頁面 - CSR (保持現有行為)

---

## 2. 資料獲取模式分析 (Data Fetching Patterns)

### 2.1 資料來源分類

**Next.js 專案的資料來源策略:**

| 資料類型 | 來源 | 獲取方式 | 快取策略 |
|---------|------|---------|---------|
| **Authentication** | Firebase Auth | Auth state listener | Real-time |
| **Organizations** | Firestore | `useDoc`, `useCollection` | Real-time listener |
| **Workspaces** | Firestore | `useDoc`, `useCollection` | Real-time listener |
| **Members** | Firestore | `useCollection` | Real-time listener |
| **Teams** | Firestore | `useCollection` | Real-time listener |
| **Partners** | Firestore | `useCollection` | Real-time listener |
| **Static Data** | Zustand Store | In-memory | Client-side state |

### 2.2 Firebase Hooks 分析

**自定義 Firebase Hooks:**

```typescript
// src/firebase/firestore/use-doc.tsx
export function useDoc<T>(path: string | null): {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// src/firebase/firestore/use-collection.tsx
export function useCollection<T>(path: string | null): {
  data: T[];
  loading: boolean;
  error: Error | null;
}

// src/firebase/auth/use-user.tsx
export function useUser(): {
  user: User | null;
  loading: boolean;
}
```

**使用模式:**
- ✅ Real-time Firestore listeners
- ✅ Automatic subscription cleanup
- ✅ Loading & error states
- ⚠️ 未使用快取 (每次 mount 重新訂閱)

### 2.3 Angular 資料層對映

**React Hooks → Angular Services:**

| React Hook | Angular Service | 實作方式 |
|-----------|----------------|---------|
| `useDoc<T>()` | `FirestoreService.doc$<T>()` | Observable + Signal |
| `useCollection<T>()` | `FirestoreService.collection$<T>()` | Observable + Signal |
| `useUser()` | `AuthService.currentUser$` | Signal |
| `useAppStore()` | `AppStateService` | Signal Store |

**範例對映:**

```typescript
// Next.js
const { data, loading, error } = useDoc<Organization>(`organizations/${id}`);

// Angular
@Component({...})
export class OrgComponent {
  private firestore = inject(FirestoreService);
  
  org = signal<Organization | null>(null);
  loading = signal(true);
  error = signal<Error | null>(null);
  
  constructor() {
    this.firestore.doc$<Organization>(`organizations/${id}`)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.org.set(data);
          this.loading.set(false);
        },
        error: (err) => this.error.set(err)
      });
  }
}
```

---

## 3. 狀態管理分析 (State Management Analysis)

### 3.1 Zustand Store 架構

**Store 結構分析:**

```typescript
// src/lib/store.ts
interface AppStore {
  // Auth State
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Organization State
  organizations: Organization[];
  activeOrgId: string | null;
  setActiveOrg: (id: string) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;

  // Workspace State
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;

  // Team State
  teams: Team[];
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;

  // Member Management
  addMemberToTeam: (teamId: string, member: Member) => void;
  removeMemberFromTeam: (teamId: string, memberId: string) => void;
  addOrgMember: (member: OrgMember) => void;
  removeOrgMember: (memberId: string) => void;

  // Static Data
  resourceBlocks: ResourceBlock[];
  capabilitySpecs: CapabilitySpec[];
  dailyLogs: DailyLog[];
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
```

**狀態特性:**
- ✅ 單一全域 store
- ✅ Immutable 更新模式
- ✅ TypeScript 類型安全
- ⚠️ 無持久化 (重新載入遺失)
- ⚠️ 無 middleware (logging, persistence)

### 3.2 Angular Signals 對映策略

**Zustand → Angular Signal Store:**

```typescript
// Angular: app-state.service.ts
@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Auth State
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();
  
  // Organization State
  private _organizations = signal<Organization[]>([]);
  organizations = this._organizations.asReadonly();
  
  private _activeOrgId = signal<string | null>(null);
  activeOrgId = this._activeOrgId.asReadonly();
  
  // Computed State
  activeOrg = computed(() => {
    const id = this._activeOrgId();
    return this._organizations().find(org => org.id === id) ?? null;
  });
  
  // Actions
  setActiveOrg(id: string): void {
    this._activeOrgId.set(id);
  }
  
  addOrganization(org: Organization): void {
    this._organizations.update(orgs => [...orgs, org]);
  }
  
  // ... other actions
}
```

**對映規則:**
1. **State** → `private signal` + `public readonly signal`
2. **Actions** → Public methods that update signals
3. **Selectors** → `computed()` signals
4. **Subscriptions** → Observable → `toSignal()`

### 3.3 跨組件狀態共享

**Next.js 模式:**
```typescript
// Component A
const { activeOrgId, setActiveOrg } = useAppStore();

// Component B (自動同步)
const { activeOrgId } = useAppStore();
```

**Angular 模式:**
```typescript
// Component A
@Component({...})
export class ComponentA {
  private appState = inject(AppStateService);
  activeOrgId = this.appState.activeOrgId;
  
  changeOrg(id: string) {
    this.appState.setActiveOrg(id);
  }
}

// Component B (自動響應)
@Component({...})
export class ComponentB {
  private appState = inject(AppStateService);
  activeOrgId = this.appState.activeOrgId; // 自動更新
}
```

---

## 4. 組件架構分析 (Component Architecture)

### 4.1 組件層次結構

**頁面組件 (Page Components):**
- 24 個頁面組件
- 負責路由和佈局
- 使用 Firebase hooks 獲取資料
- 調用 Zustand store actions

**共享組件 (Shared Components):**
- Dashboard components (header, sidebar, page-header)
- Organization components (organization-card)
- Workspace components (workspace-card, workspace-list-item)
- Firebase components (firebase-error-listener)

**UI 組件 (UI Components - ShadCN):**
- 35+ 基礎 UI 組件
- Pure presentational components
- 無業務邏輯

### 4.2 資料流向分析

**典型資料流:**

```
Firebase/Firestore (Source)
    ↓
useDoc / useCollection (Hook)
    ↓
Component State (useState)
    ↓
UI Rendering (JSX)
    ↓
User Interaction (onClick)
    ↓
Zustand Actions (State Update)
    ↓
Firestore Update (Side Effect)
    ↓
Real-time Listener Update
    ↓
Component Re-render
```

**Angular 等價流程:**

```
Firebase/Firestore (Source)
    ↓
FirestoreService.doc$ (Observable)
    ↓
toSignal() / Signal (State)
    ↓
Template Binding ({{ signal() }})
    ↓
User Interaction ((click)="method()")
    ↓
Service Method (Signal Update)
    ↓
Firestore Update (Side Effect)
    ↓
Observable Emission
    ↓
Signal Update (自動更新)
    ↓
Change Detection (OnPush)
```

---

## 5. 關鍵模式識別 (Key Patterns Identified)

### 5.1 認證流程

**Next.js 認證模式:**

```typescript
// Client-side auth check
const { user, loading } = useAppStore();

if (loading) return <Loading />;
if (!user) {
  router.push('/login');
  return null;
}

return <ProtectedContent />;
```

**Angular 認證模式:**

```typescript
// Auth Guard
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}

// Route config
{
  path: 'dashboard',
  canActivate: [AuthGuard],
  component: DashboardComponent
}
```

### 5.2 即時資料同步

**Next.js 模式:**
- Firebase Firestore real-time listeners
- 自動 component re-render
- Subscription cleanup in useEffect

**Angular 模式:**
- Observable streams from Firestore
- `toSignal()` for automatic signal updates
- `takeUntilDestroyed()` for cleanup

### 5.3 錯誤處理

**Next.js 模式:**
- Try-catch in async functions
- Error state in hooks
- Firebase error emitter (custom)

**Angular 模式:**
- RxJS error operators (`catchError`)
- Error signals
- HttpInterceptor for global errors

---

## 6. 效能特性分析 (Performance Characteristics)

### 6.1 Next.js 效能模式

| 特性 | 實作方式 | 效能影響 |
|-----|---------|---------|
| **Code Splitting** | Next.js automatic | ✅ Good |
| **Lazy Loading** | Dynamic import | ✅ Good |
| **Image Optimization** | Native img tags | ⚠️ 未優化 |
| **Data Fetching** | Real-time listeners | ⚠️ 可能過度訂閱 |
| **Re-rendering** | React reconciliation | ⚠️ 無 memo optimization |
| **Bundle Size** | ~200KB (estimated) | ✅ Acceptable |

### 6.2 Angular 優化機會

| 優化項目 | Angular 策略 | 預期改善 |
|---------|-------------|---------|
| **Change Detection** | OnPush + Signals | ⬆️ Significant |
| **Lazy Loading** | Route-level splitting | ✅ Similar |
| **Image Optimization** | NgOptimizedImage | ⬆️ Moderate |
| **Data Fetching** | Smart subscription management | ⬆️ Moderate |
| **Tree Shaking** | Standalone + Ivy | ⬆️ Slight |
| **SSR** | Angular Universal | ⬆️ Moderate (首次載入) |

---

## 7. 依賴關係分析 (Dependency Analysis)

### 7.1 核心依賴

**Next.js Dependencies:**
```json
{
  "react": "^18.x",
  "next": "^14.x",
  "firebase": "^10.x",
  "zustand": "^4.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "shadcn/ui": "components"
}
```

**Angular Dependencies (已實作):**
```json
{
  "@angular/core": "21.1.3",
  "@angular/ssr": "21.1.2",
  "firebase": "12.8.0",
  "tailwindcss": "4.1.12",
  "@angular/material": "21.1.3",
  "@angular/cdk": "21.1.3"
}
```

### 7.2 遷移依賴對映

| Next.js | Angular | 替代方案 |
|---------|---------|---------|
| React | @angular/core | Core framework |
| Next.js | @angular/ssr | SSR support |
| Zustand | Signals | Built-in state |
| ShadCN UI | Angular Material | UI library |
| Lucide React | Lucide Angular / Material Icons | Icons |
| React Hook Form | Angular Reactive Forms | Forms |

---

## 8. Phase 2 完成檢查清單 (Completion Checklist)

### 8.1 渲染策略分析
- ✅ 識別所有頁面的渲染模式 (全 CSR)
- ✅ 分析 SSR/SSG 使用情況 (未使用)
- ✅ 制定 Angular SSR 建議

### 8.2 資料獲取分析
- ✅ 分類資料來源 (Firebase direct)
- ✅ 分析 Firebase hooks 模式
- ✅ 建立 Angular service 對映

### 8.3 狀態管理分析
- ✅ Zustand store 結構完整分析
- ✅ Angular Signals 對映策略
- ✅ 跨組件狀態共享模式

### 8.4 架構分析
- ✅ 組件層次結構識別
- ✅ 資料流向分析
- ✅ 效能特性評估
- ✅ 依賴關係對映

---

## 9. 關鍵發現與建議 (Key Findings & Recommendations)

### 9.1 關鍵發現

1. **純 CSR 架構** - 所有頁面使用 CSR，無 SSR/SSG
2. **Firebase 直接整合** - 無中間 API 層，直接使用 Firebase SDK
3. **簡單狀態管理** - Zustand 提供基本全域狀態
4. **Real-time 為主** - 大量使用 Firestore real-time listeners
5. **未優化圖片** - 使用原生 img 標籤

### 9.2 Angular 遷移建議

**高優先級:**
1. ✅ 實作 SSR for landing page (SEO improvement)
2. ✅ 使用 Signals 替代 Zustand (Angular native)
3. ✅ 實作 OnPush change detection (performance)
4. ✅ 使用 NgOptimizedImage (image optimization)

**中優先級:**
5. ⚡ 實作路由 guards (auth protection)
6. ⚡ 實作 HttpInterceptor (error handling)
7. ⚡ 實作 data caching (reduce Firestore reads)

**低優先級:**
8. 🔵 預渲染靜態頁面 (optional)
9. 🔵 實作 PWA features (optional)

---

## 10. 下一步行動 (Next Actions)

**進入 Phase 3: Angular Target Architecture**

Phase 3 將設計:
1. Angular 專案初始化驗證
2. 路由對映詳細設計
3. SSR 與 SEO 策略
4. Signals 架構設計
5. Service 層架構

**前往:** [Phase 3: Angular Target Architecture](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md)

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← Phase 1: Pre-conversion Inventory](./PHASE1_PRE_CONVERSION_INVENTORY.md)
- [↑ 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)
- [→ Phase 3: Angular Target Architecture](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md)
