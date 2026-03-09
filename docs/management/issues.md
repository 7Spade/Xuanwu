# 🗂 Active Issues Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-LogicOverview.md`
> **資料來源 / Data Source**: VS5 Files + Document Parser flow review (2026-03-09)
> **格式說明**: 每條目包含 [❗ 違規] [🔍 現狀] [🛠 修正方案] [📈 影響評估]
> **最後更新**: 2026-03-09 — ISSUE-009、ISSUE-010 已確認修復並移至 `issues-archive.md`。

> **執行進度 / Execution Progress**
> - ISSUE-008: `IN_PROGRESS`（Files 動作來源矩陣已實作）
> - ISSUE-009: `RESOLVED`（已歸檔至 `issues-archive.md`）
> - ISSUE-010: `RESOLVED`（已歸檔至 `issues-archive.md`）
> - ISSUE-011: `OPEN`（待導入非同步 landing + request 去重與重入保護）

---

## ISSUE-008 · CRITICAL — 動作來源契約未鎖定：`document-ai` 與 `genkit-ai` 可能對錯誤來源執行

[❗ 違規]
- Files 動作缺少可見且可驗證的「來源契約」，與使用語義 `DOCUMENT YOU / GENKIT YOU HAVE` 不一致。
- 依 D27 / #A14，解析入口應維持語義單向與明確分流，不可讓錯誤來源進入錯誤流程。

[🔍 現狀]
- 來源矩陣邏輯已部分落地：sidecar 列已禁用 `document-ai`，且 `genkit-ai` 依關聯來源可用。
- 仍缺：UI 明確來源標記（`source: original` / `source: structured-sidecar`）與對應整合測試覆蓋。
- 現場語義需求：
  - `DOCUMENT YOU`: 原始文件走 `document-ai`
  - `GENKIT YOU HAVE`: 有結構化 sidecar 才能走 `genkit-ai`

[🛠 修正方案]
- 固化來源矩陣（程式 + UI 同步）：
  - 原始文件列：`document-ai` 可用；`genkit-ai` 僅在存在關聯 sidecar 時可用。
  - sidecar 列（`.document-ai.json`）：`document-ai` 禁用；`genkit-ai` 可用。
- 在 actions menu 顯示來源標記：`source: original` 或 `source: structured-sidecar`。
- 加入三組 UI 測試：`original-only`、`original+sidecar`、`sidecar-only`。

[📈 影響評估]
- 影響層級：VS5 Files→Parser 入口正確性。
- 風險：錯誤來源進 OCR 或語義解析會造成結果失真與操作混淆。

---

## ISSUE-011 · HIGH — `document-ai` / `genkit-ai` 缺少非同步 landing，導致重複觸發與重入風險

[❗ 違規]
- 目前 Files -> Parser 互動是「同步直送 + 立即跳頁」，沒有非同步 landing（queued/submitted/processing/completed）狀態。
- 缺少 request 去重與重入保護，違反操作可觀測與一次提交語義，容易造成重複解析。

[🔍 現狀]
- `use-workspace-files-actions.ts` 的 `handleParseWithAi` 直接 `setPendingParseFile(...)` 後 `router.push('/document-parser')`，沒有 pending lock 或 submit token。
- `files-table.tsx` 的 `Document AI / Genkit AI` 動作在送件後未進入「送件中」狀態，使用者可連續重點造成多次送件。
- `document-parser-view.tsx` 採 mount 時自動觸發 `triggerParseFromURL(...)`，目前未檢查「同 sourceFileId/sourceVersionId/parseMode 是否已在執行」。

[🛠 修正方案]
- 導入「非同步 landing」：Files 端只建立 parse request（或 intent）並導向 landing，顯示 `queued -> processing -> completed/failed`。
- 導入去重鍵：`{workspaceId, sourceFileId, sourceVersionId, parseMode}`，同鍵在有效期間內僅允許一個 in-flight request。
- UI 防重複：按鈕送出後 disabled + spinner，直到 request 進入可追蹤狀態（queued）再解除；同時提供「查看既有任務」入口而非再次提交。
- Parser 端加入重入檢查：若命中 in-flight key，直接回傳既有 requestId/intentId，不再重跑 OCR。
- 增加整合測試：連點 2~5 次 `document-ai`/`genkit-ai`，驗證只產生單一 parse request 與單一 OCR 執行紀錄。

[📈 影響評估]
- 影響層級：VS5 Files / Document Parser 交互一致性、成本控制與可觀測性。
- 風險：重複操作會造成重複 OCR 呼叫、重複解析成本、審計噪音與使用者混淆（不確定是否已送出）。

---

*最後更新: 2026-03-09 | 維護者: Copilot（Files / Document Parser 重新盤點）*
