# 🧪 New Issues (Global Inspection 2026-03-11)

> **來源 / Source**: next-devtools global scan + browser runtime metrics + `npm run check` + `npm run build`
> **檢查範圍 / Scope**: Next.js runtime diagnostics, frontend performance hotspots, lint/type quality gates
> **建立時間 / Created**: 2026-03-11

---

## ISSUE-016 · HIGH — 大量 `set-state-in-effect` 造成 cascading renders 與互動層效能風險

[❗ 問題]
- `npm run check` 出現大量 `react-hooks/set-state-in-effect` 錯誤，代表多處在 `useEffect` 中同步 `setState`。
- 這類模式會觸發額外 render 迴圈，增加互動延遲與狀態競態風險。

[🔍 證據]
- 檢查結果：`✖ 205 problems (33 errors, 172 warnings)`，其中多個 `react-hooks/set-state-in-effect`。
- 代表性檔案：
	- `src/features/workspace.slice/core/_components/dashboard-view.tsx:49`
	- `src/features/workspace.slice/core/_components/workspaces-view.tsx:41`
	- `src/features/workspace.slice/domain.document-parser/_components/document-parser-view.tsx:125`
	- `src/lib-ui/custom-ui/language-switcher.tsx:32`
	- `src/lib-ui/custom-ui/mode-toggle.tsx:28`

[🛠 建議]
- 將可推導狀態改為 render-time derivation（`useMemo`/直接計算）而非 effect 回填。
- 需要「首次 mount 標記」的邏輯改為 SSR-safe 邊界或 `useSyncExternalStore`/hydration-safe pattern。
- 以檔案群分批修復，並在每批後跑 `npm run check` 驗證回歸。

[📈 影響]
- 影響層級：多個核心 workspace UI。
- 風險：互動延遲、重複 render、狀態不一致與後續維護成本上升。

---

## ISSUE-017 · HIGH — `sidebar` render purity 違規：render path 使用 `Math.random()`

[❗ 問題]
- React purity 規則違反：在 render path 內使用 `Math.random()` 產生不穩定輸出。

[🔍 證據]
- `npm run check` error：`react-hooks/purity`。
- 檔案位置：`src/lib-ui/shadcn-ui/sidebar.tsx:665`。

[🛠 建議]
- 隨機值改為 deterministic seed（例如以 stable key 映射）或在初始化一次後固定。
- 確保 SSR/CSR 一致，不讓 hydration 依賴非純函數輸出。

[📈 影響]
- 影響層級：共用 UI 元件層。
- 風險：hydration mismatch、不可預期重繪、測試不穩定。

---

## ISSUE-018 · MEDIUM — Analytics 請求疑似配置缺口，出現 `gtag ... id=undefined`

[❗ 問題]
- 首頁資源請求出現 `https://www.googletagmanager.com/gtag/js?l=dataLayer&id=undefined`。
- 表示 analytics 初始化路徑存在配置缺口或未做條件式守衛。

[🔍 證據]
- Browser performance resource list 擷取到上述 URL，耗時約 209ms。
- 相關初始化點：`src/shared-infra/firebase-client/analytics/analytics.client.ts:15`。
- Firebase config 檔未含 `measurementId`：`src/shared-infra/firebase-client/config/firebase.config.ts:8`。

[🛠 建議]
- 對 analytics script 注入加上「有效 measurement id」前置檢查。
- 若使用 Firebase Analytics，明確定義缺省行為（關閉、降級或告警）並避免無效外部請求。

[📈 影響]
- 影響層級：首頁與全域追蹤。
- 風險：不必要外部請求、追蹤資料汙染、除錯訊號噪音。

---

## ISSUE-019 · MEDIUM — 首頁 metadata 不完整（canonical/robots 缺失）

[❗ 問題]
- metadata 掃描顯示首頁缺少 `canonical` 與 `robots`，SEO 與索引策略訊號不足。

[🔍 證據]
- 頁面檢查結果：
	- `title`: `OrgVerse | Modern Workspace Architecture`
	- `canonical`: `null`
	- `robots`: `null`
	- `locale`: `en`

[🛠 建議]
- 在 App Router metadata 中補齊 canonical 與 robots，與實際部署網域一致。
- 若有 i18n 路由策略，補齊 locale/alternate 相關 metadata。

[📈 影響]
- 影響層級：公開頁面可索引性。
- 風險：搜尋結果歸因不穩、重複內容判定風險提高。

---

## ISSUE-020 · MEDIUM — 首頁載入含較重可視化套件 chunk，影響首屏與互動預算

[❗ 問題]
- 首頁資源中可見 `vis-timeline`、`vis-network` 大型 chunk，單檔約 300KB 級別。

[🔍 證據]
- Resource timing（dev 模式）顯示：
	- `vis-timeline` chunk 約 322KB，約 207ms
	- `vis-network` chunk 約 303KB，約 195ms
- 其他導航指標：`TTFB ~93ms`、`DOMContentLoaded ~133ms`、`load ~360ms`（基礎服務端表現正常）。

[🛠 建議]
- 將非首屏必需圖形元件改為 route-level 或 interaction-level lazy loading。
- 檢查首頁是否提前引入可視化功能，避免在 `/` 預載非必要依賴。
- 加入 bundle budget 與 route chunk 監控，防止後續回歸。

[📈 影響]
- 影響層級：首頁首屏體驗與低速網路裝置。
- 風險：首屏 JS 負擔偏高，互動可用時間延後。

---

## 驗證摘要

- `next-devtools`:
	- `get_project_metadata`
	- `get_routes`
	- `get_errors`（結果：無 runtime error）
	- `get_page_metadata`
	- `get_logs`
- Browser runtime: navigation + console + performance evaluate + metadata evaluate
- CLI:
	- `npm run check`（失敗，33 errors / 172 warnings）
	- `npm run build`（成功，Next.js 16.1.6）

