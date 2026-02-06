# Phase 6: Validation and Alignment (驗證與對齊)

> **Document Type**: Phase Documentation  
> **Phase**: 6 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Previous**: [Phase 5: SSR/Async/Edge Cases](./PHASE5_SSR_ASYNC_EDGE_CASES.md) | **Next**: [Phase 7: Switch and Deprecation](./PHASE7_SWITCH_DEPRECATION.md)

---

## 目標 (Objectives)

建立完整的驗證和對齊程序，確保 Angular 實作與 Next.js 行為等價：

1. **行為比對** - 逐頁驗證功能一致性
2. **SEO 驗證** - Meta tags 和可索引性
3. **效能檢查** - Core Web Vitals 對齊
4. **測試補齊** - 單元測試和 E2E 測試

---

## 1. 行為比對程序 (Behavior Comparison)

### 1.1 頁面級比對清單

**比對維度:**

| 維度 | Next.js 基準 | Angular 驗證 | 工具 |
|-----|------------|------------|------|
| URL 結構 | `/dashboard/workspaces/:id` | Same | Manual |
| Query 參數 | `?view=grid&sort=name` | Same | Manual |
| 導航行為 | Browser back/forward | Same | Manual |
| 初次載入 | CSR | CSR (or SSR) | DevTools |
| 資料獲取 | Real-time Firestore | Same | Network tab |
| 互動反應 | Click, hover, scroll | Same | Manual |
| 狀態持久化 | In-memory (lost on refresh) | Same | Manual |

**驗證清單 (每個頁面):**

```
頁面: /dashboard/workspaces

□ URL 正確載入
□ 頁面標題正確 ("Workspaces - OrgVerse")
□ 資料正確顯示 (workspaces 列表)
□ 過濾功能正常 (按組織過濾)
□ 檢視模式切換 (grid/list)
□ 創建對話框開啟/關閉
□ 導航至詳情頁 (點擊卡片)
□ 瀏覽器返回按鈕正常
□ 即時更新 (Firestore 監聽)
□ 載入狀態顯示
□ 錯誤狀態顯示
```

### 1.2 使用者流程比對

**關鍵流程驗證:**

**流程 1: 登入流程**
```
Steps (Next.js):
1. 訪問 /login
2. 點擊 "Sign in with Google"
3. Google OAuth 彈窗
4. 授權後重定向至 /dashboard
5. 顯示用戶資訊

Validation (Angular):
□ Step 1: /login 正確載入
□ Step 2: 按鈕可點擊
□ Step 3: OAuth 彈窗出現
□ Step 4: 重定向正確
□ Step 5: 用戶資訊正確顯示
□ Session 持久化 (重新載入仍登入)
```

**流程 2: 建立工作空間**
```
Steps (Next.js):
1. 在 /dashboard/workspaces 點擊 "Create"
2. 對話框開啟
3. 填寫表單 (名稱、描述)
4. 點擊 "Create"
5. Firestore 寫入
6. 即時更新列表
7. 對話框關閉

Validation (Angular):
□ Step 1: 按鈕可點擊
□ Step 2: Material Dialog 開啟
□ Step 3: 表單欄位可輸入
□ Step 4: 送出按鈕可點擊
□ Step 5: Firestore 新增成功
□ Step 6: 新工作空間立即出現
□ Step 7: Dialog 自動關閉
□ Error handling: 表單驗證
□ Error handling: Firestore 錯誤顯示
```

**流程 3: 組織切換**
```
Steps (Next.js):
1. 點擊組織選擇器
2. 選單顯示組織列表
3. 點擊其他組織
4. activeOrgId 更新
5. 所有相關組件重新渲染
6. Workspace 列表更新為新組織的

Validation (Angular):
□ Step 1: GlobalSwitcher 可點擊
□ Step 2: mat-menu 顯示組織
□ Step 3: 可選擇組織
□ Step 4: AppState activeOrgId signal 更新
□ Step 5: Computed signals 自動更新
□ Step 6: Workspace 列表正確過濾
□ No re-fetch: 已載入資料不重複請求
```

### 1.3 邊界情況測試

**測試案例:**

```typescript
// Test Suite: Workspace Detail Page
describe('WorkspaceDetailComponent', () => {
  
  test('should handle invalid workspace ID', async () => {
    // Navigate to /dashboard/workspaces/invalid-id
    // Expected: Show "Workspace not found" message
    // Expected: Provide link to workspaces list
  });
  
  test('should handle permission denied', async () => {
    // Navigate to workspace without permission
    // Expected: Show "Access denied" message
    // Expected: Firestore permission error handled gracefully
  });
  
  test('should handle network offline', async () => {
    // Set browser to offline
    // Expected: Show offline indicator
    // Expected: Retry button when back online
  });
  
  test('should handle rapid navigation', async () => {
    // Navigate to workspace A
    // Immediately navigate to workspace B
    // Expected: Cancel subscription to A
    // Expected: Only show data for B
  });
});
```

---

## 2. SEO 驗證 (SEO Validation)

### 2.1 Meta Tags 檢查

**驗證工具:**
- Chrome DevTools (Elements tab)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

**檢查清單 (每個公開頁面):**

```html
<!-- Landing Page (/) -->
□ <title>OrgVerse - Multi-dimensional Identity Platform</title>
□ <meta name="description" content="...">
□ <meta property="og:title" content="...">
□ <meta property="og:description" content="...">
□ <meta property="og:image" content="https://orgverse.app/og-image.png">
□ <meta property="og:url" content="https://orgverse.app">
□ <meta name="twitter:card" content="summary_large_image">
□ <link rel="canonical" href="https://orgverse.app">

<!-- Login Page (/login) -->
□ <title>Login - OrgVerse</title>
□ <meta name="description" content="Sign in to OrgVerse">
□ <meta name="robots" content="noindex, nofollow">
```

### 2.2 SSR 輸出驗證

**驗證方法:**

```bash
# 建置 SSR
npm run build

# 啟動 SSR server
npm run serve:ssr

# 使用 curl 檢查 HTML
curl http://localhost:4000/ | grep '<title>'
curl http://localhost:4000/ | grep '<meta name="description"'
curl http://localhost:4000/ | grep 'OrgVerse'

# 檢查是否有初始內容 (不是空白頁面)
curl http://localhost:4000/ | grep '<h1>'
```

**預期結果:**

```html
<!-- SSR 輸出應包含: -->
- <title> tag with correct text
- <meta> tags with descriptions
- Initial page content (not empty <app-root>)
- JSON-LD structured data (if applicable)
```

### 2.3 可索引性檢查

**Lighthouse SEO 檢查:**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run SEO audit
lighthouse http://localhost:4000 \
  --only-categories=seo \
  --output html \
  --output-path ./lighthouse-report.html
```

**目標分數:**
- SEO Score: ≥ 90
- All meta tags present: ✅
- Crawlable links: ✅
- robots.txt exists: ✅
- Valid canonical URLs: ✅

---

## 3. 效能檢查 (Performance Validation)

### 3.1 Core Web Vitals 目標

| 指標 | Next.js 基準 | Angular 目標 | 測量工具 |
|-----|------------|------------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | Lighthouse |
| **FID** (First Input Delay) | < 100ms | < 100ms | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | Lighthouse |
| **FCP** (First Contentful Paint) | < 1.8s | < 1.8s | Lighthouse |
| **TTI** (Time to Interactive) | < 3.8s | < 3.8s | Lighthouse |
| **TTFB** (Time to First Byte) | < 600ms | < 600ms | Network tab |

### 3.2 效能測試程序

**Lighthouse 測試:**

```bash
# Performance audit (desktop)
lighthouse http://localhost:4000 \
  --only-categories=performance \
  --preset=desktop \
  --output html \
  --output-path ./lighthouse-desktop.html

# Performance audit (mobile)
lighthouse http://localhost:4000 \
  --only-categories=performance \
  --preset=mobile \
  --output html \
  --output-path ./lighthouse-mobile.html
```

**Bundle 大小比對:**

```bash
# Next.js bundle
du -sh .next/

# Angular bundle
du -sh dist/Xuanwu/browser/

# Check JS bundle sizes
ls -lh dist/Xuanwu/browser/*.js
```

**目標:**
- Initial bundle < 200KB (gzipped)
- Total bundle < 500KB (gzipped)
- Lazy routes < 50KB each (gzipped)

### 3.3 效能優化檢查清單

```
□ Lazy loading implemented for all feature modules
□ NgOptimizedImage used for all images
□ OnPush change detection on all components
□ Signals used instead of RxJS where possible
□ No memory leaks (subscriptions cleaned up)
□ Preload critical routes
□ Defer non-critical content (@defer)
□ Minimize third-party scripts
□ Tree-shaking effective (no unused code)
□ Service worker (PWA) configured (optional)
```

---

## 4. 測試補齊 (Test Completion)

### 4.1 測試策略

**測試金字塔:**

```
        E2E Tests (5%)
          /      \
     Integration Tests (15%)
         /              \
    Unit Tests (80%)
```

### 4.2 單元測試 (Unit Tests)

**測試範圍 (使用 Vitest):**

**Services:**
```typescript
// app-state.service.spec.ts
describe('AppStateService', () => {
  let service: AppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppStateService);
  });

  it('should set user', () => {
    const user = { uid: '123', email: 'test@test.com' };
    service.setUser(user);
    expect(service.user()).toEqual(user);
  });

  it('should compute activeOrg', () => {
    const orgs = [
      { id: 'org1', name: 'Org 1' },
      { id: 'org2', name: 'Org 2' }
    ];
    service.setOrganizations(orgs);
    service.setActiveOrg('org1');
    expect(service.activeOrg()).toEqual(orgs[0]);
  });
});
```

**Components:**
```typescript
// workspace-card.component.spec.ts
describe('WorkspaceCardComponent', () => {
  it('should render workspace name', () => {
    const fixture = TestBed.createComponent(WorkspaceCardComponent);
    const component = fixture.componentInstance;
    component.workspace = { id: '1', name: 'Test Workspace' };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain('Test Workspace');
  });

  it('should emit click event', () => {
    const fixture = TestBed.createComponent(WorkspaceCardComponent);
    const component = fixture.componentInstance;
    let clickedId: string | null = null;
    
    component.workspaceClick.subscribe((id: string) => {
      clickedId = id;
    });
    
    component.handleClick();
    expect(clickedId).toBe(component.workspace.id);
  });
});
```

**目標覆蓋率:**
- Statements: ≥ 80%
- Branches: ≥ 75%
- Functions: ≥ 80%
- Lines: ≥ 80%

### 4.3 E2E 測試 (使用 Playwright)

**關鍵流程測試:**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login with Google', async ({ page }) => {
    await page.goto('/login');
    
    // Click Google Sign In
    await page.click('button:has-text("Sign in with Google")');
    
    // Handle OAuth flow (in test environment)
    // ...
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show user info
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });
});

// e2e/workspace.spec.ts
test.describe('Workspace Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await loginAsTestUser(page);
  });

  test('should create new workspace', async ({ page }) => {
    await page.goto('/dashboard/workspaces');
    
    // Open create dialog
    await page.click('button:has-text("Create")');
    
    // Fill form
    await page.fill('[data-testid="workspace-name"]', 'Test Workspace');
    await page.fill('[data-testid="workspace-description"]', 'Test Description');
    
    // Submit
    await page.click('button:has-text("Create")');
    
    // Should appear in list
    await expect(page.locator('text=Test Workspace')).toBeVisible();
  });
});
```

---

## 5. Phase 6 完成檢查清單 (Completion Checklist)

### 5.1 行為比對
- ✅ 頁面級比對清單
- ✅ 關鍵流程驗證 (3+ flows)
- ✅ 邊界情況測試

### 5.2 SEO 驗證
- ✅ Meta tags 檢查程序
- ✅ SSR 輸出驗證
- ✅ Lighthouse SEO 測試
- ✅ 可索引性檢查

### 5.3 效能檢查
- ✅ Core Web Vitals 目標
- ✅ Lighthouse 測試程序
- ✅ Bundle 大小比對
- ✅ 優化檢查清單

### 5.4 測試補齊
- ✅ 測試策略定義
- ✅ 單元測試範例
- ✅ E2E 測試範例
- ✅ 覆蓋率目標

---

## 6. 下一步行動 (Next Actions)

**進入 Phase 7: Switch and Deprecation**

Phase 7 將規劃:
1. 分階段上線策略
2. 流量切換方案
3. Next.js 退役程序
4. 監控和回滾

**前往:** [Phase 7: Switch and Deprecation](./PHASE7_SWITCH_DEPRECATION.md)

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← Phase 5: SSR/Async/Edge Cases](./PHASE5_SSR_ASYNC_EDGE_CASES.md)
- [↑ 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)
- [→ Phase 7: Switch and Deprecation](./PHASE7_SWITCH_DEPRECATION.md)
