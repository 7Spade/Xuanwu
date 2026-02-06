# Phase 5: SSR/Async/Edge Cases (SSR與非同步處理)

> **Document Type**: Phase Documentation  
> **Phase**: 5 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Previous**: [Phase 4: Functional Module Conversion](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md) | **Next**: [Phase 6: Validation and Alignment](./PHASE6_VALIDATION_ALIGNMENT.md)

---

## 目標 (Objectives)

處理 SSR 環境特有的挑戰和邊界情況：

1. **SSR 安全性** - 瀏覽器 API 使用檢查
2. **非同步流程重建** - Resolvers 和資料預載
3. **認證與權限** - SSR/CSR 一致性
4. **環境變數** - 建置時vs執行時配置
5. **錯誤處理** - 統一錯誤邊界

---

## 1. SSR 安全性處理 (SSR Safety)

### 1.1 瀏覽器 API 檢查

**問題:** 在 SSR 環境中，`window`, `document`, `localStorage` 等瀏覽器 API 不存在

**解決方案:**

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({...})
export class MyComponent {
  private platformId = inject(PLATFORM_ID);
  
  // Method 1: isPlatformBrowser 檢查
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 安全使用瀏覽器 API
      const data = localStorage.getItem('key');
      window.addEventListener('resize', this.handleResize);
    }
  }
  
  // Method 2: afterNextRender (推薦)
  constructor() {
    afterNextRender(() => {
      // 此處保證在瀏覽器環境
      window.scrollTo(0, 0);
      localStorage.setItem('visited', 'true');
    });
  }
  
  // Method 3: typeof window 檢查
  checkBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
```

### 1.2 常見 SSR 不安全模式

**不安全 ❌:**

```typescript
// Direct window access
const width = window.innerWidth;

// Direct localStorage
const token = localStorage.getItem('token');

// Direct document manipulation
document.getElementById('myElement');

// Third-party libraries assuming browser
import SomeBrowserLibrary from 'browser-only-lib';
```

**安全 ✅:**

```typescript
import { afterNextRender } from '@angular/core';

constructor() {
  afterNextRender(() => {
    const width = window.innerWidth;
    const token = localStorage.getItem('token');
    const el = document.getElementById('myElement');
  });
}

// Or with signal
private _windowWidth = signal(0);
windowWidth = this._windowWidth.asReadonly();

constructor() {
  afterNextRender(() => {
    this._windowWidth.set(window.innerWidth);
    window.addEventListener('resize', () => {
      this._windowWidth.set(window.innerWidth);
    });
  });
}
```

### 1.3 Firebase SSR 安全

**Firebase 初始化檢查:**

```typescript
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private platformId = inject(PLATFORM_ID);
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  
  constructor() {
    // Only initialize in browser
    if (isPlatformBrowser(this.platformId)) {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
    }
  }
  
  getAuth(): Auth {
    if (!this.auth) {
      throw new Error('Auth not available in SSR');
    }
    return this.auth;
  }
}
```

---

## 2. 非同步流程重建 (Async Flow Rebuilding)

### 2.1 Route Resolvers

**用途:** 在路由激活前預載資料，避免畫面閃爍

**範例: WorkspaceResolver:**

```typescript
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Workspace } from '@/types';
import { FirestoreService } from '@/core/services/firestore.service';
import { firstValueFrom } from 'rxjs';

export const workspaceResolver: ResolveFn<Workspace | null> = async (route) => {
  const firestore = inject(FirestoreService);
  const id = route.paramMap.get('id');
  
  if (!id) return null;
  
  try {
    // Wait for first emission
    const workspace = await firstValueFrom(
      firestore.doc$<Workspace>(`workspaces/${id}`)
    );
    return workspace;
  } catch (error) {
    console.error('Failed to load workspace:', error);
    return null;
  }
};

// Route configuration
{
  path: 'workspaces/:id',
  component: WorkspaceDetailComponent,
  resolve: { workspace: workspaceResolver },
  title: 'Workspace Detail'
}

// Component usage
@Component({...})
export class WorkspaceDetailComponent {
  private route = inject(ActivatedRoute);
  
  // Data already resolved
  workspace = toSignal(
    this.route.data.pipe(map(data => data['workspace']))
  );
}
```

### 2.2 TransferState (SSR → CSR 資料傳遞)

**用途:** 避免 SSR 和 CSR 重複請求相同資料

**TransferState Service:**

```typescript
import { Injectable, inject, TransferState, makeStateKey } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransferStateService {
  private transferState = inject(TransferState);
  
  get<T>(key: string, fallback: Observable<T>): Observable<T> {
    const stateKey = makeStateKey<T>(key);
    
    // Check if data exists in transfer state
    if (this.transferState.hasKey(stateKey)) {
      const data = this.transferState.get(stateKey, null);
      this.transferState.remove(stateKey);
      return of(data!);
    }
    
    // If not, fetch and store
    return fallback.pipe(
      tap(data => this.transferState.set(stateKey, data))
    );
  }
}

// Usage in resolver
export const orgResolver: ResolveFn<Organization[]> = async () => {
  const firestore = inject(FirestoreService);
  const transferState = inject(TransferStateService);
  
  return firstValueFrom(
    transferState.get(
      'organizations',
      firestore.collection$<Organization>('organizations')
    )
  );
};
```

### 2.3 Deferred Loading (延遲載入)

**用途:** 非關鍵資料延遲載入，優化首次渲染

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div>
      <!-- Critical content -->
      <h1>Dashboard</h1>
      
      <!-- Deferred content -->
      @defer (on viewport) {
        <app-analytics-chart />
      } @loading {
        <p>Loading chart...</p>
      } @placeholder {
        <div class="chart-skeleton"></div>
      }
    </div>
  `
})
export class DashboardComponent {}
```

---

## 3. 認證與權限處理 (Authentication & Authorization)

### 3.1 SSR 認證流程

**挑戰:** Firebase Auth 依賴瀏覽器，SSR 時無法直接獲取認證狀態

**解決方案 1: Cookie-based Auth (推薦):**

```typescript
// Server-side (SSR)
import { Injectable } from '@angular/core';
import { REQUEST } from '@angular/ssr';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SsrAuthService {
  private request = inject(REQUEST, { optional: true });
  
  getUserFromCookie(): User | null {
    if (!this.request) return null;
    
    const cookies = this.request.headers.cookie || '';
    const authCookie = cookies.split(';')
      .find(c => c.trim().startsWith('auth_token='));
    
    if (!authCookie) return null;
    
    const token = authCookie.split('=')[1];
    // Verify and decode token
    return this.verifyToken(token);
  }
}

// Auth Guard with SSR support
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private ssrAuthService = inject(SsrAuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  
  canActivate(): Observable<boolean> | boolean {
    // SSR: Check cookie
    if (!isPlatformBrowser(this.platformId)) {
      const user = this.ssrAuthService.getUserFromCookie();
      return !!user;
    }
    
    // CSR: Check Firebase Auth
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

**解決方案 2: Public Routes Only for SSR:**

```typescript
// Disable SSR for authenticated routes
{
  path: 'dashboard',
  component: DashboardLayoutComponent,
  canActivate: [AuthGuard],
  data: { prerender: false } // Skip SSR for this route
}
```

### 3.2 權限檢查一致性

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private appState = inject(AppStateService);
  
  // Computed permission (works in SSR and CSR)
  canEditOrg = computed(() => {
    const user = this.appState.user();
    const org = this.appState.activeOrg();
    
    if (!user || !org) return false;
    
    return org.adminIds?.includes(user.uid) || 
           org.ownerId === user.uid;
  });
  
  // Method-based permission check
  hasPermission(action: string, resource: string): boolean {
    const user = this.appState.user();
    const org = this.appState.activeOrg();
    
    // Permission logic here
    return this.checkPermission(user, org, action, resource);
  }
}

// Component usage
@Component({
  template: `
    @if (permissionService.canEditOrg()) {
      <button (click)="editOrg()">Edit Organization</button>
    }
  `
})
export class OrgComponent {
  permissionService = inject(PermissionService);
}
```

---

## 4. 環境變數與配置 (Environment Variables)

### 4.1 環境檔案結構

**Angular 環境配置:**

```typescript
// src/environments/environment.ts (Production)
export const environment = {
  production: true,
  firebase: {
    apiKey: 'PRODUCTION_API_KEY',
    authDomain: 'project.firebaseapp.com',
    projectId: 'project-prod',
    storageBucket: 'project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef'
  },
  apiUrl: 'https://api.orgverse.app'
};

// src/environments/environment.development.ts (Development)
export const environment = {
  production: false,
  firebase: {
    apiKey: 'DEV_API_KEY',
    authDomain: 'project-dev.firebaseapp.com',
    projectId: 'project-dev',
    storageBucket: 'project-dev.appspot.com',
    messagingSenderId: '987654321',
    appId: '1:987654321:web:fedcba'
  },
  apiUrl: 'http://localhost:3000'
};
```

### 4.2 Runtime Configuration (執行時配置)

**用途:** 需要在部署後修改的配置

```typescript
// src/app/core/config/app.config.ts
export interface AppConfig {
  production: boolean;
  firebase: FirebaseConfig;
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
  };
}

// Load from assets/config.json at runtime
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private config$ = new BehaviorSubject<AppConfig | null>(null);
  
  async loadConfig(): Promise<void> {
    const config = await firstValueFrom(
      this.http.get<AppConfig>('/assets/config.json')
    );
    this.config$.next(config);
  }
  
  get config(): AppConfig | null {
    return this.config$.value;
  }
}

// APP_INITIALIZER
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadConfig(),
      deps: [ConfigService],
      multi: true
    }
  ]
};
```

---

## 5. 錯誤處理與邊界 (Error Handling & Boundaries)

### 5.1 Global Error Handler

```typescript
import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notificationService = inject(NotificationService);
  
  handleError(error: Error): void {
    // Log to console
    console.error('Global error:', error);
    
    // Show user-friendly message
    this.notificationService.showError(
      'An unexpected error occurred. Please try again.'
    );
    
    // Send to error tracking service (e.g., Sentry)
    // this.errorTrackingService.logError(error);
  }
}

// Register in providers
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

### 5.2 HTTP Interceptor for API Errors

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      
      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
```

### 5.3 Component Error Boundaries

```typescript
@Component({
  selector: 'app-error-boundary',
  template: `
    @if (hasError()) {
      <div class="error-container">
        <h2>Something went wrong</h2>
        <p>{{ errorMessage() }}</p>
        <button (click)="retry()">Try Again</button>
      </div>
    } @else {
      <ng-content />
    }
  `
})
export class ErrorBoundaryComponent {
  hasError = signal(false);
  errorMessage = signal('');
  
  @Input() onRetry?: () => void;
  
  catchError(error: Error): void {
    this.hasError.set(true);
    this.errorMessage.set(error.message);
  }
  
  retry(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
    this.onRetry?.();
  }
}
```

---

## 6. Phase 5 完成檢查清單 (Completion Checklist)

### 6.1 SSR 安全性
- ✅ isPlatformBrowser 檢查模式
- ✅ afterNextRender 使用模式
- ✅ Firebase SSR 安全初始化
- ✅ 常見不安全模式識別

### 6.2 非同步流程
- ✅ Route Resolvers 實作
- ✅ TransferState 使用
- ✅ Deferred Loading 策略

### 6.3 認證與權限
- ✅ SSR 認證流程
- ✅ Cookie-based auth 策略
- ✅ 權限檢查一致性

### 6.4 環境配置
- ✅ Environment files 結構
- ✅ Runtime configuration 實作
- ✅ 建置時vs執行時配置

### 6.5 錯誤處理
- ✅ Global Error Handler
- ✅ HTTP Interceptor
- ✅ Component Error Boundaries

---

## 7. 下一步行動 (Next Actions)

**進入 Phase 6: Validation and Alignment**

Phase 6 將建立:
1. 行為比對程序
2. SEO 驗證
3. 效能檢查
4. 測試策略

**前往:** [Phase 6: Validation and Alignment](./PHASE6_VALIDATION_ALIGNMENT.md)

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← Phase 4: Functional Module Conversion](./PHASE4_FUNCTIONAL_MODULE_CONVERSION.md)
- [↑ 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)
- [→ Phase 6: Validation and Alignment](./PHASE6_VALIDATION_ALIGNMENT.md)
