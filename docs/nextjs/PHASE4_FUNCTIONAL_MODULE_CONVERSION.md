# Phase 4: Functional Module Conversion (功能模組化轉換)

> **Document Type**: Phase Documentation  
> **Phase**: 4 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Previous**: [Phase 3: Angular Target Architecture](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md) | **Next**: [Phase 5: SSR/Async/Edge Cases](./PHASE5_SSR_ASYNC_EDGE_CASES.md)

---

## 目標 (Objectives)

詳細規劃 React 組件、Hooks 和業務邏輯到 Angular 的轉換策略：

1. **UI 組件轉換** - React Components → Angular Components
2. **狀態與生命週期** - Hooks → Signals + Lifecycle
3. **模板轉換** - JSX → Angular Template
4. **樣式遷移** - CSS Modules → SCSS + Tailwind
5. **UI 庫對映** - ShadCN → Angular Material

---

## 1. UI 組件轉換策略 (UI Component Conversion)

### 1.1 組件轉換對映表

**頁面組件轉換 (Page Components):**

| Next.js Component | Angular Component | 路徑 | 複雜度 |
|------------------|------------------|------|-------|
| `LandingPage` | `LandingComponent` | `features/landing/` | Low |
| `LoginPage` | `LoginComponent` | `features/auth/` | Low |
| `DashboardPage` | `DashboardHomeComponent` | `features/dashboard/` | Medium |
| `OrganizationSettingsPage` | `OrgSettingsComponent` | `features/organization/settings/` | Medium |
| `OrganizationMembersPage` | `OrgMembersComponent` | `features/organization/members/` | High |
| `OrganizationTeamsPage` | `TeamsComponent` | `features/organization/teams/` | Medium |
| `TeamDetailPage` | `TeamDetailComponent` | `features/organization/teams/detail/` | High |
| `PartnersPage` | `PartnersComponent` | `features/organization/partners/` | High |
| `PartnerDetailPage` | `PartnerDetailComponent` | `features/organization/partners/detail/` | High |
| `WorkspacesPage` | `WorkspacesComponent` | `features/workspaces/` | Medium |
| `WorkspaceDetailPage` | `WorkspaceDetailComponent` | `features/workspaces/detail/` | High |

**共享組件轉換 (Shared Components):**

| Next.js Component | Angular Component | 路徑 | 類型 |
|------------------|------------------|------|------|
| `DashboardSidebar` | `DashboardSidebarComponent` | `shared/components/sidebar/` | Layout |
| `DashboardHeader` | `DashboardHeaderComponent` | `shared/components/header/` | Layout |
| `PageHeader` | `PageHeaderComponent` | `shared/components/page-header/` | UI |
| `OrganizationCard` | `OrganizationCardComponent` | `shared/components/organization-card/` | UI |
| `WorkspaceCard` | `WorkspaceCardComponent` | `shared/components/workspace-card/` | UI |
| `WorkspaceListItem` | `WorkspaceListItemComponent` | `shared/components/workspace-list-item/` | UI |

### 1.2 組件轉換範例

**React Component (Next.js):**

```typescript
// src/app/dashboard/workspaces/page.tsx
export default function WorkspacesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { workspaces, activeOrgId } = useAppStore();
  const router = useRouter();

  const filteredWorkspaces = workspaces.filter(
    ws => ws.orgId === activeOrgId
  );

  return (
    <div className="p-6">
      <PageHeader 
        title="Workspaces"
        description="Manage your workspaces"
      />
      
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setViewMode('grid')}>Grid</Button>
        <Button onClick={() => setViewMode('list')}>List</Button>
        <Button onClick={() => setIsCreateOpen(true)}>Create</Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredWorkspaces.map(ws => (
            <WorkspaceCard 
              key={ws.id} 
              workspace={ws}
              onClick={() => router.push(`/dashboard/workspaces/${ws.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWorkspaces.map(ws => (
            <WorkspaceListItem key={ws.id} workspace={ws} />
          ))}
        </div>
      )}

      <CreateWorkspaceDialog 
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
```

**Angular Component:**

```typescript
// src/app/features/workspaces/workspaces.component.ts
@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    WorkspaceCardComponent,
    WorkspaceListItemComponent,
    CreateWorkspaceDialogComponent,
    MatButtonModule
  ]
})
export class WorkspacesComponent {
  private appState = inject(AppStateService);
  private router = inject(Router);

  // Signals (替代 useState)
  viewMode = signal<'grid' | 'list'>('grid');
  isCreateOpen = signal(false);

  // Computed (替代過濾邏輯)
  filteredWorkspaces = computed(() => {
    const orgId = this.appState.activeOrgId();
    return this.appState.workspaces()
      .filter(ws => ws.orgId === orgId);
  });

  // Methods (替代 event handlers)
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  openCreateDialog(): void {
    this.isCreateOpen.set(true);
  }

  closeCreateDialog(): void {
    this.isCreateOpen.set(false);
  }

  navigateToWorkspace(id: string): void {
    this.router.navigate(['/dashboard/workspaces', id]);
  }
}
```

**Angular Template:**

```html
<!-- src/app/features/workspaces/workspaces.component.html -->
<div class="p-6">
  <app-page-header 
    title="Workspaces"
    description="Manage your workspaces"
  />
  
  <div class="flex gap-2 mb-4">
    <button mat-raised-button (click)="setViewMode('grid')">Grid</button>
    <button mat-raised-button (click)="setViewMode('list')">List</button>
    <button mat-raised-button color="primary" (click)="openCreateDialog()">
      Create
    </button>
  </div>

  @if (viewMode() === 'grid') {
    <div class="grid grid-cols-3 gap-4">
      @for (workspace of filteredWorkspaces(); track workspace.id) {
        <app-workspace-card 
          [workspace]="workspace"
          (click)="navigateToWorkspace(workspace.id)"
        />
      }
    </div>
  } @else {
    <div class="space-y-2">
      @for (workspace of filteredWorkspaces(); track workspace.id) {
        <app-workspace-list-item [workspace]="workspace" />
      }
    </div>
  }

  <app-create-workspace-dialog 
    [open]="isCreateOpen()"
    (close)="closeCreateDialog()"
  />
</div>
```

---

## 2. Hooks 到 Signals 轉換 (Hooks to Signals)

### 2.1 React Hooks 對映表

| React Hook | Angular 替代 | 用途 |
|-----------|------------|------|
| `useState` | `signal()` | 本地狀態 |
| `useEffect` | `effect()` / `afterNextRender()` | 副作用 |
| `useMemo` | `computed()` | 計算值 |
| `useCallback` | 方法 (無需特殊處理) | 回調函數 |
| `useContext` | `inject()` + Service | 跨組件狀態 |
| `useRef` | `viewChild()` / `ElementRef` | DOM 引用 |
| `useRouter` | `Router` service | 路由 |
| `useParams` | `ActivatedRoute.paramMap` | 路由參數 |

### 2.2 轉換範例

**useState → signal:**

```typescript
// React
const [count, setCount] = useState(0);

// Angular
count = signal(0);
// Usage: count() to read, count.set(1) or count.update(n => n + 1)
```

**useEffect → effect / afterNextRender:**

```typescript
// React - Side effect
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);

// Angular - effect (for signals)
constructor() {
  effect(() => {
    console.log('Count changed:', this.count());
  });
}

// React - DOM side effect
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// Angular - afterNextRender (for DOM)
constructor() {
  afterNextRender(() => {
    document.title = `Count: ${this.count()}`;
  });
}
```

**useMemo → computed:**

```typescript
// React
const doubledCount = useMemo(() => count * 2, [count]);

// Angular
doubledCount = computed(() => this.count() * 2);
```

**useContext → inject + Service:**

```typescript
// React
const { user } = useAppStore();

// Angular
private appState = inject(AppStateService);
user = this.appState.user;
```

---

## 3. JSX 到 Angular Template 轉換 (JSX to Template)

### 3.1 語法對映

| JSX 語法 | Angular Template | 說明 |
|---------|-----------------|------|
| `{expression}` | `{{ expression }}` | 文本插值 |
| `className={...}` | `[class]="..."` | 動態 class |
| `style={{...}}` | `[style]="..."` | 動態 style |
| `onClick={...}` | `(click)="..."` | 事件綁定 |
| `{condition && <Component />}` | `@if (condition) { <component /> }` | 條件渲染 |
| `{items.map(...)}` | `@for (item of items; track item.id) { }` | 列表渲染 |
| `{condition ? A : B}` | `@if (condition) { A } @else { B }` | 條件分支 |

### 3.2 控制流轉換

**條件渲染 (Conditional Rendering):**

```jsx
// React JSX
{loading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{!loading && !error && <Content data={data} />}
```

```html
<!-- Angular Template -->
@if (loading()) {
  <app-loading-spinner />
}
@if (error()) {
  <app-error-message [error]="error()" />
}
@if (!loading() && !error()) {
  <app-content [data]="data()" />
}
```

**列表渲染 (List Rendering):**

```jsx
// React JSX
{workspaces.map(ws => (
  <WorkspaceCard 
    key={ws.id}
    workspace={ws}
    onClick={() => handleClick(ws.id)}
  />
))}
```

```html
<!-- Angular Template -->
@for (workspace of workspaces(); track workspace.id) {
  <app-workspace-card 
    [workspace]="workspace"
    (click)="handleClick(workspace.id)"
  />
}
```

**條件分支 (Switch Case):**

```jsx
// React JSX
{status === 'loading' && <Loading />}
{status === 'error' && <Error />}
{status === 'success' && <Success />}
```

```html
<!-- Angular Template -->
@switch (status()) {
  @case ('loading') {
    <app-loading />
  }
  @case ('error') {
    <app-error />
  }
  @case ('success') {
    <app-success />
  }
}
```

---

## 4. 樣式遷移 (Styles Migration)

### 4.1 Tailwind CSS 保留

**保留 Tailwind 類別:**

```html
<!-- React JSX -->
<div className="flex flex-col gap-4 p-6">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
</div>

<!-- Angular Template (相同) -->
<div class="flex flex-col gap-4 p-6">
  <h1 class="text-2xl font-bold">Title</h1>
  <p class="text-gray-600">Description</p>
</div>
```

**動態類別 (Dynamic Classes):**

```jsx
// React
<div className={`btn ${isActive ? 'btn-active' : 'btn-inactive'}`}>

// Angular
<div [class]="'btn ' + (isActive() ? 'btn-active' : 'btn-inactive')">
<!-- 或使用 class binding -->
<div class="btn" [class.btn-active]="isActive()" [class.btn-inactive]="!isActive()">
```

### 4.2 組件樣式

**SCSS Modules (可選):**

```scss
// workspace-card.component.scss
:host {
  display: block;
  
  .card {
    @apply rounded-lg border p-4 shadow-sm;
    
    &:hover {
      @apply shadow-md;
    }
  }
  
  .title {
    @apply text-lg font-semibold;
  }
}
```

---

## 5. UI 組件庫對映 (UI Library Mapping)

### 5.1 ShadCN → Angular Material

| ShadCN Component | Angular Material | 替代方案 |
|-----------------|-----------------|---------|
| `Button` | `mat-button` | ✅ Direct |
| `Dialog` | `MatDialog` | ✅ Service-based |
| `Input` | `mat-form-field` + `mat-input` | ✅ Direct |
| `Select` | `mat-select` | ✅ Direct |
| `Card` | `mat-card` | ✅ Direct |
| `Table` | `mat-table` | ✅ Direct |
| `Tabs` | `mat-tab-group` | ✅ Direct |
| `Tooltip` | `matTooltip` | ✅ Directive |
| `Popover` | `mat-menu` | ⚡ Similar |
| `Sheet` | `mat-sidenav` | ⚡ Similar |
| `Toast` | `MatSnackBar` | ⚡ Different API |
| `Sidebar` | Custom + `mat-sidenav` | 🔵 Custom |

### 5.2 組件轉換範例

**Button 轉換:**

```jsx
// React (ShadCN)
<Button variant="default" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Angular (Material)
<button mat-raised-button color="primary" (click)="handleClick()">
  Click Me
</button>
```

**Dialog 轉換:**

```typescript
// React (ShadCN)
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>

// Angular (Material) - Component
openDialog(): void {
  const dialogRef = this.dialog.open(MyDialogComponent, {
    data: { title: 'Title', description: 'Description' }
  });
  
  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed:', result);
  });
}

// Template
<button mat-button (click)="openDialog()">Open</button>
```

---

## 6. 資料層轉換 (Data Layer Conversion)

### 6.1 Firebase Hooks → Services

**useDoc Hook → FirestoreService:**

```typescript
// React
const { data, loading, error } = useDoc<Organization>(`organizations/${id}`);

// Angular
@Component({...})
export class OrgComponent {
  private firestore = inject(FirestoreService);
  private route = inject(ActivatedRoute);

  orgId = toSignal(this.route.paramMap.pipe(map(p => p.get('id')!)));
  
  org = toSignal(
    toObservable(this.orgId).pipe(
      switchMap(id => this.firestore.doc$<Organization>(`organizations/${id}`))
    )
  );
  
  // Or using effect
  private _org = signal<Organization | null>(null);
  org = this._org.asReadonly();
  
  constructor() {
    effect(() => {
      const id = this.orgId();
      if (id) {
        this.firestore.doc$<Organization>(`organizations/${id}`)
          .pipe(takeUntilDestroyed())
          .subscribe(org => this._org.set(org));
      }
    });
  }
}
```

### 6.2 Zustand Actions → Service Methods

```typescript
// React (Zustand)
const { addOrganization } = useAppStore();
addOrganization(newOrg);

// Angular (Service)
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private appState = inject(AppStateService);
  private firestore = inject(FirestoreService);

  async addOrganization(data: Partial<Organization>): Promise<void> {
    const org = await this.firestore.add('organizations', data);
    this.appState.addOrganization(org);
  }
}

// Component usage
private orgService = inject(OrganizationService);
await this.orgService.addOrganization(newOrg);
```

---

## 7. Phase 4 完成檢查清單 (Completion Checklist)

### 7.1 組件轉換
- ✅ 頁面組件對映表 (11 components)
- ✅ 共享組件對映表 (6 components)
- ✅ 轉換範例 (WorkspacesPage)
- ✅ 組件檔案結構

### 7.2 Hooks/Signals
- ✅ React Hooks 對映表
- ✅ useState → signal 轉換
- ✅ useEffect → effect 轉換
- ✅ useMemo → computed 轉換
- ✅ useContext → inject 轉換

### 7.3 模板轉換
- ✅ JSX → Template 語法對映
- ✅ 條件渲染轉換
- ✅ 列表渲染轉換
- ✅ 事件處理轉換

### 7.4 樣式與UI
- ✅ Tailwind CSS 保留策略
- ✅ 組件樣式 (SCSS)
- ✅ ShadCN → Material 對映
- ✅ UI 組件轉換範例

### 7.5 資料層
- ✅ Firebase Hooks → Services
- ✅ Zustand Actions → Service Methods
- ✅ 資料流重建

---

## 8. 下一步行動 (Next Actions)

**進入 Phase 5: SSR/Async/Edge Cases**

Phase 5 將處理:
1. SSR 安全性處理
2. 非同步流程重建
3. 認證與權限
4. 環境變數配置
5. 邊界情況處理

**前往:** [Phase 5: SSR/Async/Edge Cases](./PHASE5_SSR_ASYNC_EDGE_CASES.md)

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← Phase 3: Angular Target Architecture](./PHASE3_ANGULAR_TARGET_ARCHITECTURE.md)
- [↑ 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)
- [→ Phase 5: SSR/Async/Edge Cases](./PHASE5_SSR_ASYNC_EDGE_CASES.md)
