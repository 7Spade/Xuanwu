# 🗂 Active Issues Register

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-LogicOverview.md`
> **資料來源 / Data Source**: VS5 Files + Document Parser flow review (2026-03-09)
> **格式說明**: 每條目包含 [❗ 違規] [🔍 現狀] [🛠 修正方案] [📈 影響評估]
> **最後更新**: 2026-03-09 — 已啟動修復實作（ISSUE-008~010 程式碼已落地，待整體驗證）。

> **執行進度 / Execution Progress**
> - ISSUE-008: `IN_PROGRESS`（Files 動作來源矩陣已實作）
> - ISSUE-009: `IN_PROGRESS`（`parseMode/sourceType/triggeredFrom` 已加入 payload）
> - ISSUE-010: `IN_PROGRESS`（非 JSON 回應容錯已實作）

---

## ISSUE-008 · CRITICAL — 動作來源契約未鎖定：`document-ai` 與 `genkit-ai` 可能對錯誤來源執行

[❗ 違規]
- Files 動作缺少可見且可驗證的「來源契約」，與使用語義 `DOCUMENT YOU / GENKIT YOU HAVE` 不一致。
- 依 D27 / #A14，解析入口應維持語義單向與明確分流，不可讓錯誤來源進入錯誤流程。

[🔍 現狀]
- `document-ai` 目前對當前列檔案可直接觸發；若列本身是 `.document-ai.json` sidecar 也可能被送入同一流程。
- `genkit-ai` 依關聯 sidecar 推導來源，但規則僅存在程式邏輯，UI 沒有明確顯示來源。
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

## ISSUE-009 · HIGH — `document-ai` / `genkit-ai` 缺少 parseMode 追蹤，無法精確審計

[❗ 違規]
- 兩個 UI 動作都走同一路徑，但 payload 未攜帶 `parseMode`，導致 Document Parser 無法判定觸發語義。

[🔍 現狀]
- Files 兩個按鈕皆透過同一 handler 導向 `/document-parser`。
- `pendingParseFile` 未包含：
  - `parseMode: 'document-ai' | 'genkit-ai'`
  - `sourceType: 'original' | 'structured-sidecar'`
  - `triggeredFrom`
- 異常回報時，無法回答是 DOCUMENT 路徑或 GENKIT 路徑失敗。

[🛠 修正方案]
- 擴充 `pendingParseFile` 契約：`parseMode`、`sourceType`、`triggeredFrom`。
- Document Parser 首屏顯示當前模式與來源，並寫入 audit/event。
- 錯誤訊息統一前綴 parseMode，提升排查效率。

[📈 影響評估]
- 影響層級：可觀測性、審計追溯與除錯效率。
- 風險：不同語義事件混流，造成誤診與重複修復。

---

## ISSUE-010 · HIGH — Document Parser 對非 JSON 上游錯誤缺乏韌性

[❗ 違規]
- `extractDataFromDocument` 直接假設上游回應為 JSON；遇到 text/plain 錯誤時，前端會拋 `Unexpected token ... is not valid JSON`。

[🔍 現狀]
- `process-document.fn.ts` 內部回應分支是 JSON。
- 實際前端仍曾收到非 JSON（疑似 upstream/proxy 層回應）。
- 目前錯誤訊息缺少 `status/content-type/endpoint/parseMode`，診斷資訊不足。

[🛠 修正方案]
- 在 `_form-actions.ts` 依 `content-type` 分支處理：
  - `application/json` → `response.json()`
  - 其他 → `response.text()` 並標準化為可讀錯誤。
- 錯誤模型統一帶出：`status`, `contentType`, `endpoint`, `traceId?`, `parseMode`。
- 增加最小整合測試：模擬 text/plain 500，確認 UI 不再出現 JSON parse exception。

[📈 影響評估]
- 影響層級：VS5 Document Parser 可用性與穩定性。
- 風險：網路或 gateway 異常時，前台訊息不可解釋，延遲修復。

---

*最後更新: 2026-03-09 | 維護者: Copilot（Files / Document Parser 重新盤點）*
