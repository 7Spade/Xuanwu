# Phase 3: Angular Target Architecture (目標架構設計)

> **Document Type**: Phase Documentation  
> **Phase**: 3 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Previous**: [Phase 2: Next.js Architecture Analysis](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md) | **Next**: [Phase 4: Functional Module Conversion](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md)

---

## 目標 (Objectives)

基於 Phase 1 和 Phase 2 的分析結果，設計完整的 Angular 目標架構：

1. **驗證 Angular 專案配置** - 確認現有 Angular 21 專案符合需求
2. **設計路由對映** - Next.js routes → Angular routes 詳細對映
3. **設計 SSR/SEO 策略** - 優化首次載入和搜索引擎可見性
4. **設計 Signals 架構** - 建立響應式狀態管理系統
5. **設計服務層架構** - Firebase 整合和業務邏輯分層

---

## 1. Angular 專案配置驗證 (Project Configuration Verification)

### 1.1 現有配置檢查

**Angular 專案資訊:**

| 配置項 | 值 | 狀態 |
|--------|---|------|
| **Angular 版本** | 21.1.3 | ✅ Latest |
| **專案名稱** | Xuanwu | ✅ |
| **專案類型** | Application | ✅ |
| **Builder** | @angular/build:application | ✅ |
| **Root** | (project root) | ✅ |
| **Source Root** | src | ✅ |
| **Style Language** | SCSS | ✅ |
| **SSR Support** | @angular/ssr 21.1.2 | ✅ Installed |

**package.json 關鍵配置:**

```json
{
  "dependencies": {
    "@angular/animations": "21.1.3",
    "@angular/cdk": "21.1.3",
    "@angular/common": "21.1.3",
    "@angular/core": "21.1.3",
    "@angular/forms": "21.1.3",
    "@angular/material": "21.1.3",
    "@angular/platform-browser": "21.1.3",
    "@angular/platform-server": "21.1.0",
    "@angular/router": "21.1.3",
    "@angular/ssr": "21.1.2",
    "firebase": "12.8.0",
    "rxjs": "7.8.0"
  }
}
```

✅ **驗證結果:** 所有必要依賴已安裝且版本符合要求

### 1.2 Standalone 架構驗證

**應用程式配置 (src/app/core/providers/app.config.ts):**

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),  // ✅ Zoneless
    provideRouter(routes),              // ✅ Router
    provideClientHydration(),           // ✅ SSR Hydration
    provideAnimationsAsync(),           // ✅ Animations
    provideHttpClient(
      withFetch(),                      // ✅ Modern fetch API
      withInterceptors([...])           // ✅ Interceptors
    ),
    // Firebase providers
    // Custom providers
  ]
};
```

✅ **驗證結果:** 
- Standalone architecture configured
- Zoneless change detection enabled
- SSR support with hydration
- Modern Angular features activated

---

## 2. 路由對映設計 (Route Mapping Design)

### 2.1 完整路由對映表

**Next.js → Angular 路由轉換:**

| # | Next.js Path | Angular Route | Component | Guard | Resolver | SSR |
|---|-------------|---------------|-----------|-------|----------|-----|
| 1 | `/` | `''` | `LandingComponent` | - | - | ✅ |
| 2 | `/login` | `login` | `LoginComponent` | `NoAuthGuard` | - | ❌ |
| 3 | `/dashboard` | `dashboard` | `DashboardLayoutComponent` | `AuthGuard` | `DashboardResolver` | ⚡ |
| 4 | `/dashboard` (index) | `dashboard` (index) | `DashboardHomeComponent` | `AuthGuard` | `HomeResolver` | ❌ |
| 5 | `/dashboard/blocks` | `dashboard/blocks` | `BlocksComponent` | `AuthGuard` | - | ❌ |
| 6 | `/dashboard/settings` | `dashboard/settings` | `SettingsComponent` | `AuthGuard` | - | ❌ |
| 7 | `/dashboard/team` | `dashboard/team` | `TeamComponent` | `AuthGuard` | - | ❌ |
| 8 | `/dashboard/organization/audit` | `dashboard/organization/audit` | `AuditComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 9 | `/dashboard/organization/daily` | `dashboard/organization/daily` | `DailyComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 10 | `/dashboard/organization/external` | `dashboard/organization/external` | `ExternalComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 11 | `/dashboard/organization/matrix` | `dashboard/organization/matrix` | `MatrixComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 12 | `/dashboard/organization/members` | `dashboard/organization/members` | `MembersComponent` | `AuthGuard + OrgGuard` | `MembersResolver` | ❌ |
| 13 | `/dashboard/organization/partners` | `dashboard/organization/partners` | `PartnersComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 14 | `/dashboard/organization/partners/[id]` | `dashboard/organization/partners/:id` | `PartnerDetailComponent` | `AuthGuard + OrgGuard` | `PartnerResolver` | ❌ |
| 15 | `/dashboard/organization/schedule` | `dashboard/organization/schedule` | `ScheduleComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 16 | `/dashboard/organization/settings` | `dashboard/organization/settings` | `OrgSettingsComponent` | `AuthGuard + OrgGuard` | `OrgResolver` | ❌ |
| 17 | `/dashboard/organization/teams` | `dashboard/organization/teams` | `TeamsComponent` | `AuthGuard + OrgGuard` | - | ❌ |
| 18 | `/dashboard/organization/teams/[id]` | `dashboard/organization/teams/:id` | `TeamDetailComponent` | `AuthGuard + OrgGuard` | `TeamResolver` | ❌ |
| 19 | `/dashboard/workspaces` | `dashboard/workspaces` | `WorkspacesComponent` | `AuthGuard` | - | ❌ |
| 20 | `/dashboard/workspaces/[id]` | `dashboard/workspaces/:id` | `WorkspaceDetailComponent` | `AuthGuard` | `WorkspaceResolver` | ❌ |
| 21 | `/dashboard/workspaces/blocks` | `dashboard/workspaces/blocks` | `WorkspaceBlocksComponent` | `AuthGuard` | - | ❌ |
| 22 | `/dashboard/workspaces/capabilities` | `dashboard/workspaces/capabilities` | `CapabilitiesComponent` | `AuthGuard` | - | ❌ |

### 2.2 路由配置代碼

**app.routes.ts (主路由):**

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: LandingComponent,
    title: 'OrgVerse - Multi-dimensional Identity Platform'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard],
    title: 'Login - OrgVerse'
  },
  
  // Protected dashboard routes
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    resolve: { dashboard: DashboardResolver },
    children: [
      {
        path: '',
        component: DashboardHomeComponent,
        resolve: { home: HomeResolver },
        title: 'Dashboard - OrgVerse'
      },
      {
        path: 'blocks',
        component: BlocksComponent,
        title: 'Resource Blocks - OrgVerse'
      },
      {
        path: 'settings',
        component: SettingsComponent,
        title: 'Settings - OrgVerse'
      },
      {
        path: 'team',
        component: TeamComponent,
        title: 'Team - OrgVerse'
      },
      
      // Organization routes
      {
        path: 'organization',
        canActivate: [OrgGuard],
        children: [
          {
            path: 'audit',
            component: AuditComponent,
            title: 'Audit Logs - OrgVerse'
          },
          {
            path: 'daily',
            component: DailyComponent,
            title: 'Daily Logs - OrgVerse'
          },
          {
            path: 'members',
            component: MembersComponent,
            resolve: { members: MembersResolver },
            title: 'Members - OrgVerse'
          },
          {
            path: 'teams',
            children: [
              {
                path: '',
                component: TeamsComponent,
                title: 'Teams - OrgVerse'
              },
              {
                path: ':id',
                component: TeamDetailComponent,
                resolve: { team: TeamResolver },
                title: 'Team Detail - OrgVerse'
              }
            ]
          },
          {
            path: 'partners',
            children: [
              {
                path: '',
                component: PartnersComponent,
                title: 'Partners - OrgVerse'
              },
              {
                path: ':id',
                component: PartnerDetailComponent,
                resolve: { partner: PartnerResolver },
                title: 'Partner Detail - OrgVerse'
              }
            ]
          },
          // ... other org routes
        ]
      },
      
      // Workspace routes
      {
        path: 'workspaces',
        children: [
          {
            path: '',
            component: WorkspacesComponent,
            title: 'Workspaces - OrgVerse'
          },
          {
            path: ':id',
            component: WorkspaceDetailComponent,
            resolve: { workspace: WorkspaceResolver },
            title: 'Workspace - OrgVerse'
          },
          {
            path: 'blocks',
            component: WorkspaceBlocksComponent,
            title: 'Workspace Blocks - OrgVerse'
          },
          {
            path: 'capabilities',
            component: CapabilitiesComponent,
            title: 'Capabilities - OrgVerse'
          }
        ]
      }
    ]
  },
  
  // 404
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - OrgVerse'
  }
];
```

### 2.3 Route Guards 實作

**AuthGuard (認證守衛):**

```typescript
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
```

**OrgGuard (組織權限守衛):**

```typescript
@Injectable({ providedIn: 'root' })
export class OrgGuard implements CanActivate {
  private appState = inject(AppStateService);
  private router = inject(Router);

  canActivate(): boolean {
    const activeOrgId = this.appState.activeOrgId();
    if (!activeOrgId) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
```

---

## 3. SSR 與 SEO 策略 (SSR & SEO Strategy)

### 3.1 SSR 配置

**server.ts (Server-side rendering entry):**

```typescript
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}
```

### 3.2 SSR 策略決策

**頁面 SSR 優先級:**

| 頁面 | SSR | Prerender | 理由 |
|-----|-----|-----------|------|
| `/` | ✅ Yes | ✅ Yes | SEO critical, 首次載入優化 |
| `/login` | ❌ No | ✅ Yes | 改善首次載入，非 SEO 關鍵 |
| `/dashboard/*` | ⚡ Optional | ❌ No | 需要認證，SEO 不重要 |

**實作方式:**

```typescript
// angular.json - prerender configuration
{
  "prerender": {
    "discoverRoutes": false,
    "routes": [
      "/",
      "/login"
    ]
  }
}
```

### 3.3 Meta 標籤管理

**Meta Service 實作:**

```typescript
@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  updateMeta(config: {
    title: string;
    description: string;
    ogImage?: string;
    ogUrl?: string;
  }): void {
    this.titleService.setTitle(config.title);
    
    this.metaService.updateTag({
      name: 'description',
      content: config.description
    });
    
    this.metaService.updateTag({
      property: 'og:title',
      content: config.title
    });
    
    this.metaService.updateTag({
      property: 'og:description',
      content: config.description
    });
    
    if (config.ogImage) {
      this.metaService.updateTag({
        property: 'og:image',
        content: config.ogImage
      });
    }
    
    if (config.ogUrl) {
      this.metaService.updateTag({
        property: 'og:url',
        content: config.ogUrl
      });
    }
  }
}
```

**組件使用:**

```typescript
@Component({
  selector: 'app-landing',
  template: `...`
})
export class LandingComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateMeta({
      title: 'OrgVerse - Multi-dimensional Identity Platform',
      description: 'Manage your multi-dimensional organizational identity with OrgVerse',
      ogImage: '/assets/og-image.png',
      ogUrl: 'https://orgverse.app'
    });
  }
}
```

---

## 4. Signals 架構設計 (Signals Architecture)

### 4.1 AppStateService (全域狀態)

**核心狀態服務:**

```typescript
@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Auth State
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  
  // Organization State
  private _organizations = signal<Organization[]>([]);
  readonly organizations = this._organizations.asReadonly();
  
  private _activeOrgId = signal<string | null>(null);
  readonly activeOrgId = this._activeOrgId.asReadonly();
  
  // Workspace State
  private _workspaces = signal<Workspace[]>([]);
  readonly workspaces = this._workspaces.asReadonly();
  
  // Computed State
  readonly activeOrg = computed(() => {
    const id = this._activeOrgId();
    return this._organizations().find(org => org.id === id) ?? null;
  });
  
  readonly activeOrgWorkspaces = computed(() => {
    const orgId = this._activeOrgId();
    return this._workspaces().filter(ws => ws.orgId === orgId);
  });
  
  readonly isAuthenticated = computed(() => this._user() !== null);
  
  // Actions
  setUser(user: User | null): void {
    this._user.set(user);
  }
  
  setActiveOrg(id: string): void {
    this._activeOrgId.set(id);
  }
  
  addOrganization(org: Organization): void {
    this._organizations.update(orgs => [...orgs, org]);
  }
  
  updateOrganization(id: string, updates: Partial<Organization>): void {
    this._organizations.update(orgs =>
      orgs.map(org => org.id === id ? { ...org, ...updates } : org)
    );
  }
  
  // ... other actions
}
```

### 4.2 Feature State Services

**OrganizationService (功能狀態):**

```typescript
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private firestore = inject(FirestoreService);
  private appState = inject(AppStateService);
  
  // Local feature state
  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();
  
  private _error = signal<Error | null>(null);
  readonly error = this._error.asReadonly();
  
  // Computed from global state
  readonly currentOrg = computed(() => this.appState.activeOrg());
  
  // Methods
  async createOrganization(data: Partial<Organization>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const org = await this.firestore.add('organizations', data);
      this.appState.addOrganization(org);
      this.appState.setActiveOrg(org.id);
    } catch (error) {
      this._error.set(error as Error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }
  
  // ... other methods
}
```

### 4.3 Component Signals

**組件層級 Signals:**

```typescript
@Component({
  selector: 'app-workspace-detail',
  templateUrl: './workspace-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceDetailComponent implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private route = inject(ActivatedRoute);
  
  // Local component state
  readonly workspaceId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')!))
  );
  
  // Derived from service
  readonly workspace = computed(() => {
    const id = this.workspaceId();
    return this.workspaceService.getWorkspace(id);
  });
  
  readonly loading = this.workspaceService.loading;
  readonly error = this.workspaceService.error;
  
  // Template usage
  // {{ workspace()?.name }}
  // @if (loading()) { <loading-spinner /> }
  // @if (error()) { <error-message [error]="error()" /> }
}
```

---

## 5. 服務層架構設計 (Service Layer Architecture)

### 5.1 服務分層

**服務層次結構:**

```
Core Services (src/app/core/services/)
├── firebase.service.ts          (Firebase 初始化)
├── auth.service.ts              (認證服務)
└── firestore.service.ts         (Firestore 基礎操作)

Feature Services (src/app/features/*/services/)
├── organization.service.ts      (組織業務邏輯)
├── workspace.service.ts         (工作空間業務邏輯)
├── team.service.ts              (團隊業務邏輯)
└── member.service.ts            (成員業務邏輯)

Shared Services (src/app/shared/services/)
├── dialog.service.ts            (對話框服務)
├── notification.service.ts      (通知服務)
├── translation.service.ts       (多語言服務)
└── platform.service.ts          (平台檢測)
```

### 5.2 FirestoreService (基礎服務)

```typescript
@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);
  
  // Document operations
  doc$<T>(path: string): Observable<T | null> {
    const docRef = doc(this.firestore, path);
    return docData(docRef) as Observable<T | null>;
  }
  
  // Collection operations
  collection$<T>(path: string, queryFn?: QueryConstraint[]): Observable<T[]> {
    const colRef = collection(this.firestore, path);
    const q = queryFn ? query(colRef, ...queryFn) : colRef;
    return collectionData(q) as Observable<T[]>;
  }
  
  // Add document
  async add<T>(path: string, data: Partial<T>): Promise<T> {
    const colRef = collection(this.firestore, path);
    const docRef = await addDoc(colRef, data);
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as T;
  }
  
  // Update document
  async update(path: string, data: Partial<unknown>): Promise<void> {
    const docRef = doc(this.firestore, path);
    await updateDoc(docRef, data);
  }
  
  // Delete document
  async delete(path: string): Promise<void> {
    const docRef = doc(this.firestore, path);
    await deleteDoc(docRef);
  }
}
```

### 5.3 AuthService (認證服務)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private appState = inject(AppStateService);
  
  // Current user as signal
  readonly currentUser$ = authState(this.auth);
  readonly currentUser = toSignal(this.currentUser$, { initialValue: null });
  
  // Auth state
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  
  // Sign in with Google
  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    this.appState.setUser(result.user as User);
  }
  
  // Sign out
  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.appState.setUser(null);
  }
  
  // ... other auth methods
}
```

---

## 6. Phase 3 完成檢查清單 (Completion Checklist)

### 6.1 專案配置
- ✅ Angular 21.1.3 驗證
- ✅ Standalone 架構確認
- ✅ SSR 支援確認
- ✅ Zoneless 配置確認

### 6.2 路由設計
- ✅ 完整路由對映表 (24 routes)
- ✅ Guards 實作設計
- ✅ Resolvers 實作設計
- ✅ 嵌套路由結構

### 6.3 SSR/SEO 策略
- ✅ SSR 配置設計
- ✅ Prerender 策略
- ✅ Meta 標籤管理
- ✅ SEO 服務設計

### 6.4 Signals 架構
- ✅ AppStateService 設計
- ✅ Feature services 設計
- ✅ Component signals 模式
- ✅ Computed signals 策略

### 6.5 服務層
- ✅ 服務分層設計
- ✅ FirestoreService 設計
- ✅ AuthService 設計
- ✅ Feature services 架構

---

## 7. 下一步行動 (Next Actions)

**進入 Phase 4: Functional Module Conversion**

Phase 4 將詳細設計:
1. React 組件 → Angular 組件轉換策略
2. Hooks → Signals/Lifecycle 轉換
3. JSX → Angular Template 轉換
4. 樣式遷移策略
5. UI 組件庫對映 (ShadCN → Material)

**前往:** [Phase 4: Functional Module Conversion](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md)

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← Phase 2: Next.js Architecture Analysis](./PHASE2_NEXTJS_ARCHITECTURE_ANALYSIS.md)
- [↑ 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)
- [→ Phase 4: Functional Module Conversion](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md)
