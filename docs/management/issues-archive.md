# 🗂 Issues Archive

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **說明**: 本文件存檔所有已關閉的 Issues（狀態為 RESOLVED / WONT_FIX / DUPLICATE）。
> 活躍 Issues 請見 `issues.md`。

---

## 歸檔流程 / Archival Process

當一個 Issue 滿足以下任一條件時，從 `issues.md` 移入本文件：

- **RESOLVED**: 修正方案已實作並通過驗證
- **WONT_FIX**: 評估後決定不修復（需附理由）
- **DUPLICATE**: 確認與另一 Issue 重複（需附連結）

歸檔時保留原始條目格式，並在頂部加入關閉記錄：

```
**關閉日期**: YYYY-MM-DD
**關閉原因**: RESOLVED / WONT_FIX / DUPLICATE
**關閉備注**: (說明修復 commit 或不修復理由)
```

---

## 已歸檔條目 / Archived Entries

## ISSUE-009 · HIGH — `document-ai` / `genkit-ai` 缺少 parseMode 追蹤，無法精確審計

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `pendingParseFile` 已包含 `parseMode/sourceType/triggeredFrom`；Files 與 Parser 端均已接線並可在錯誤訊息與審計事件中辨識 parse mode。

[❗ 違規]
- 兩個 UI 動作都走同一路徑，但 payload 未攜帶 `parseMode`，導致 Document Parser 無法判定觸發語義。

[🔍 現狀（關閉前）]
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

[✅ 驗證證據]
- `src/features/workspace.slice/core.event-bus/_events.ts`
- `src/features/workspace.slice/business.files/_hooks/use-workspace-files-actions.ts`
- `src/features/workspace.slice/business.document-parser/_form-actions.ts`

[📈 影響評估]
- 影響層級：可觀測性、審計追溯與除錯效率。
- 成效：不同語義事件可被正確區分，降低誤診與重複修復。

---

## ISSUE-010 · HIGH — Document Parser 對非 JSON 上游錯誤缺乏韌性

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `_form-actions.ts` 已依 `content-type` 分支解析（JSON/Text），並在錯誤字串中帶出 `status/contentType/endpoint/parseMode`。

[❗ 違規]
- `extractDataFromDocument` 直接假設上游回應為 JSON；遇到 text/plain 錯誤時，前端會拋 `Unexpected token ... is not valid JSON`。

[🔍 現狀（關閉前）]
- `process-document.fn.ts` 內部回應分支是 JSON。
- 實際前端仍曾收到非 JSON（疑似 upstream/proxy 層回應）。
- 目前錯誤訊息缺少 `status/content-type/endpoint/parseMode`，診斷資訊不足。

[🛠 修正方案]
- 在 `_form-actions.ts` 依 `content-type` 分支處理：
	- `application/json` -> `response.json()`
	- 其他 -> `response.text()` 並標準化為可讀錯誤。
- 錯誤模型統一帶出：`status`, `contentType`, `endpoint`, `traceId?`, `parseMode`。

[✅ 驗證證據]
- `src/features/workspace.slice/business.document-parser/_form-actions.ts`

[📈 影響評估]
- 影響層級：VS5 Document Parser 可用性與穩定性。
- 成效：上游非 JSON 失敗情境不再觸發 JSON parse exception，錯誤可讀性提升。

---

*最後更新: 2026-03-09 | 維護者: Copilot（Files / Document Parser 問題清理）*
