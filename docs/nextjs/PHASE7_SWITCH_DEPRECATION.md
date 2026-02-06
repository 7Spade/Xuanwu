# Phase 7: Switch and Deprecation (切換與退場)

> **Document Type**: Phase Documentation  
> **Phase**: 7 of 7  
> **Status**: ✅ Completed  
> **Last Updated**: 2026-02-06  
> **Previous**: [Phase 6: Validation and Alignment](./PHASE6_VALIDATION_ALIGNMENT.md)

---

## 目標 (Objectives)

規劃從 Next.js 到 Angular 的平滑過渡和 Next.js 專案的退役：

1. **分階段上線** - 降低風險的漸進式部署
2. **流量切換** - DNS/路由層級的流量導向
3. **監控與回滾** - 即時監控和快速復原
4. **Next.js 退役** - 安全移除舊系統

---

## 1. 分階段上線策略 (Staged Rollout)

### 1.1 部署階段規劃

**階段 0: 準備階段 (Week 0)**

```
目標: 完成所有部署前準備

Checklist:
□ Angular 應用完整建置成功
□ 所有 Phase 6 驗證通過
□ Production 環境配置完成
□ Firebase Hosting 設置完成
□ 監控工具部署 (Sentry, Analytics)
□ 回滾方案測試完成
□ 團隊部署培訓完成
```

**階段 1: Beta 測試 (Week 1)**

```
目標: 內部測試 Angular 版本

部署:
- Deploy Angular to beta.orgverse.app
- 僅限團隊成員存取

驗證:
□ 所有關鍵流程正常
□ SSR 正常運作
□ Firebase 整合正常
□ 效能符合目標
□ 無明顯 bugs

回滾條件:
- Critical bugs 超過 3 個
- 效能 regression > 30%
- 團隊無法完成核心任務
```

**階段 2: Canary 部署 (Week 2)**

```
目標: 5% 真實用戶流量

部署:
- 5% 流量導向 Angular (via A/B test)
- 95% 流量保持在 Next.js

監控指標:
□ Error rate < 0.5%
□ LCP < 2.5s
□ Bounce rate 無顯著變化
□ Conversion rate 無顯著下降

回滾條件:
- Error rate > 1%
- 效能 regression > 20%
- 用戶投訴 > 10%
```

**階段 3: 漸進式推出 (Week 3-4)**

```
Week 3: 25% 流量
Week 4: 50% 流量

監控:
□ 持續監控所有指標
□ 每日檢查錯誤日誌
□ 收集用戶反饋

調整:
- 修復發現的 bugs
- 效能優化
- UX 改善
```

**階段 4: 完全切換 (Week 5)**

```
目標: 100% 流量到 Angular

部署:
- 100% 流量導向 Angular
- Next.js 保持運行作為備份

穩定期:
- 持續監控 1-2 週
- 確認無重大問題

Success Criteria:
□ Error rate < 0.3%
□ 效能指標達標
□ 用戶滿意度無下降
```

**階段 5: Next.js 退役 (Week 6+)**

```
目標: 安全移除 Next.js

步驟:
1. 確認 Angular 穩定運行 2 週+
2. 備份 Next.js codebase
3. 停止 Next.js 服務
4. 移除 Next.js 部署
5. 清理相關資源

保留:
□ Git repository (archive)
□ 文件備份
□ 資料庫快照
```

### 1.2 部署環境配置

**環境策略:**

| 環境 | URL | 用途 | 部署方式 |
|------|-----|------|---------|
| Development | localhost:4200 | 本地開發 | `ng serve` |
| Staging | staging.orgverse.app | 測試環境 | Firebase Hosting |
| Beta | beta.orgverse.app | Beta 測試 | Firebase Hosting |
| Production (Next.js) | orgverse.app | 生產環境 (舊) | Vercel |
| Production (Angular) | orgverse.app | 生產環境 (新) | Firebase Hosting |

**Firebase Hosting 配置:**

```json
// firebase.json
{
  "hosting": {
    "public": "dist/Xuanwu/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "angularUniversal"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

---

## 2. 流量切換方案 (Traffic Switching)

### 2.1 DNS 層級切換

**方案 A: 直接 DNS 切換 (簡單但風險較高)**

```
Before:
orgverse.app → Vercel (Next.js)

After:
orgverse.app → Firebase Hosting (Angular)

優點:
- 簡單直接
- 無需額外設置

缺點:
- 無法漸進式推出
- 回滾較慢 (DNS propagation)
- 不適合 A/B 測試
```

**方案 B: Load Balancer 切換 (推薦)**

```
架構:
Cloud Load Balancer
  ├─ 95% → Vercel (Next.js)
  └─ 5% → Firebase (Angular)

優點:
- 支援漸進式推出
- 快速回滾
- 支援 A/B 測試
- 即時流量調整

設置:
1. Google Cloud Load Balancer
2. 配置 backend services:
   - Next.js backend (Vercel)
   - Angular backend (Firebase)
3. 設置流量分配規則
4. 漸進式調整比例
```

### 2.2 Feature Flag 切換 (細粒度控制)

```typescript
// Feature flag service
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags = signal({
    useNewWorkspaceUI: false,
    useNewOrgManagement: false,
    useNewAuth: false
  });

  isEnabled(flag: string): boolean {
    return this.flags()[flag] ?? false;
  }

  async loadFlags(): Promise<void> {
    // Load from Firebase Remote Config
    const remoteFlags = await getRemoteConfig();
    this.flags.set(remoteFlags);
  }
}

// Component usage
@Component({
  template: `
    @if (featureFlags.isEnabled('useNewWorkspaceUI')) {
      <app-new-workspace-list />
    } @else {
      <app-legacy-workspace-list />
    }
  `
})
export class WorkspacesComponent {
  featureFlags = inject(FeatureFlagService);
}
```

---

## 3. 監控與回滾 (Monitoring & Rollback)

### 3.1 監控指標

**Real-time 監控 (Sentry + Firebase Analytics):**

```typescript
// Sentry setup
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: environment.production ? 'production' : 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0, // 100% for beta, lower in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Analytics events
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  logEvent(event: string, params?: any): void {
    logEvent(getAnalytics(), event, params);
  }

  logError(error: Error, context?: any): void {
    Sentry.captureException(error, { extra: context });
    this.logEvent('error', { message: error.message, ...context });
  }

  logPerformance(metric: string, value: number): void {
    this.logEvent('performance', { metric, value });
  }
}
```

**儀表板指標:**

```
Real-time Monitoring Dashboard

Error Metrics:
- Error rate (per hour)
- Error types distribution
- Affected users count

Performance Metrics:
- LCP (p50, p75, p95)
- FID (p50, p75, p95)
- CLS (p50, p75, p95)
- TTFB (p50, p75, p95)

Business Metrics:
- Active users
- Conversion rate
- Bounce rate
- Session duration

Firebase Metrics:
- Firestore reads/writes
- Auth success rate
- Function invocations
```

### 3.2 自動警報

**警報規則:**

```yaml
# Cloud Monitoring Alerts
alerts:
  - name: High Error Rate
    condition: error_rate > 1% for 5 minutes
    severity: CRITICAL
    notification: email, slack
    
  - name: Performance Degradation
    condition: LCP_p75 > 3s for 10 minutes
    severity: WARNING
    notification: slack
    
  - name: Low Availability
    condition: uptime < 99% for 5 minutes
    severity: CRITICAL
    notification: email, slack, pagerduty
    
  - name: High Firestore Costs
    condition: firestore_reads > 1M per hour
    severity: WARNING
    notification: email
```

### 3.3 回滾程序

**快速回滾 (< 5 分鐘):**

```bash
# Option 1: Load Balancer 流量切換
gcloud compute backend-services update angular-backend \
  --global \
  --traffic-split=0

# Option 2: Firebase Hosting rollback
firebase hosting:clone PREVIOUS_VERSION:live

# Option 3: DNS 切換 (slower, ~30 min)
# Update DNS A record to point back to Vercel
```

**回滾決策標準:**

```
Automatic Rollback Triggers:
- Error rate > 5% for 5 minutes
- Uptime < 95% for 5 minutes
- Critical service down (Firebase Auth, Firestore)

Manual Rollback Triggers:
- Error rate > 2% for 15 minutes
- Performance regression > 50%
- Critical bug affecting > 10% users
- Data integrity issue
```

---

## 4. Next.js 退役程序 (Next.js Deprecation)

### 4.1 退役前檢查清單

```
Pre-Deprecation Checklist (所有項目必須 ✅):

Technical:
□ Angular 穩定運行 ≥ 2 週
□ Error rate < 0.3%
□ 效能指標達標
□ 所有關鍵功能驗證通過
□ 備份程序已執行

Business:
□ 用戶滿意度無下降
□ Conversion rate 穩定
□ 無重大用戶投訴
□ 團隊培訓完成

Compliance:
□ 資料遷移完成
□ 審計日誌保存
□ 合規要求滿足
```

### 4.2 退役步驟

**Step 1: 程式碼歸檔**

```bash
# 1. Create archive branch
cd nextjs-orgverse
git checkout main
git checkout -b archive/final-version
git push origin archive/final-version

# 2. Tag final release
git tag -a v-final -m "Final Next.js version before deprecation"
git push origin v-final

# 3. Archive repository
# GitHub: Settings → Archive this repository
```

**Step 2: 服務停止**

```bash
# 1. Stop Vercel deployment
vercel --prod --delete

# 2. Remove DNS records pointing to Vercel
# (if applicable)

# 3. Cancel Vercel subscription
# (via Vercel dashboard)
```

**Step 3: 資源清理**

```
Cleanup Checklist:

Infrastructure:
□ Vercel project deleted
□ Vercel domain disconnected
□ Old environment variables removed
□ Old secrets removed

Repositories:
□ Next.js repo archived (not deleted)
□ Deployment workflows disabled
□ README updated with deprecation notice

Documentation:
□ Migration complete notice in README
□ Archive location documented
□ Angular docs updated as primary
```

**Step 4: 知識轉移**

```
Knowledge Transfer:

Documentation:
□ All Next.js tribal knowledge documented
□ Migration lessons learned documented
□ Post-mortem completed

Team:
□ Angular best practices training
□ New deployment procedures training
□ Monitoring and alert handling training
```

---

## 5. Phase 7 完成檢查清單 (Completion Checklist)

### 5.1 分階段上線
- ✅ 部署階段規劃 (5 階段)
- ✅ 環境配置
- ✅ Beta 測試策略
- ✅ Canary 部署策略

### 5.2 流量切換
- ✅ DNS 切換方案
- ✅ Load Balancer 策略
- ✅ Feature Flag 設計

### 5.3 監控與回滾
- ✅ 監控指標定義
- ✅ 自動警報設置
- ✅ 回滾程序
- ✅ 回滾決策標準

### 5.4 Next.js 退役
- ✅ 退役前檢查清單
- ✅ 程式碼歸檔程序
- ✅ 服務停止步驟
- ✅ 資源清理清單
- ✅ 知識轉移計劃

---

## 6. 總結 (Summary)

### 6.1 遷移完成標準

**Technical Excellence:**
- ✅ All 24 pages migrated and functional
- ✅ All user flows working correctly
- ✅ SSR functioning properly
- ✅ Performance targets met
- ✅ Test coverage ≥ 80%
- ✅ Zero critical bugs

**Business Success:**
- ✅ User satisfaction maintained or improved
- ✅ Conversion rates stable
- ✅ No increase in support tickets
- ✅ Team fully trained on Angular
- ✅ Documentation complete

**Operational Readiness:**
- ✅ Monitoring in place
- ✅ Alerts configured
- ✅ Rollback procedures tested
- ✅ Runbooks created

### 6.2 長期維護計劃

**Week 1-4: 密集監控**
- 每日檢查錯誤日誌
- 每日檢查效能指標
- 快速修復任何問題

**Month 2-3: 穩定期**
- 每週檢查指標
- 持續優化效能
- 收集用戶反饋

**Month 4+: 常態運營**
- 月度效能審查
- 季度技術債務清理
- 持續功能迭代

---

## 7. 下一步行動 (Next Actions)

**遷移完成後:**

1. **慶祝成功!** 🎉
2. **回顧總結:**
   - What went well?
   - What could be improved?
   - Lessons learned
3. **未來規劃:**
   - Feature roadmap
   - Technical improvements
   - Team growth

---

**文件狀態:** ✅ 完成  
**審核狀態:** ✅ 已驗證  
**最後更新:** 2026-02-06  
**維護者:** Migration Team

**導航:**
- [← Phase 6: Validation and Alignment](./PHASE6_VALIDATION_ALIGNMENT.md)
- [↑ 返回索引](./MIGRATION_ARCHITECTURE_INDEX.md)

---

**🎉 恭喜！7-Phase Migration Architecture 完整文件完成！**
