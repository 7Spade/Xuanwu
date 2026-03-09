# Mobile Friendliness Report — Xuanwu (簡要)

檢查日期：2026-03-10
環境：Next.js dev server (`npm run dev`) 運行於 `http://localhost:9002`
測試帳號：test@demo.com（已嘗試）

## 檢查範圍
- 首頁（/）與 `/login`（登入 modal）
- 三種模擬 viewport：360x800 (mobile), 412x915 (mobile), 768x1024 (tablet)
- 檢查項目：meta viewport、水平捲軸/過寬元素、觸控目標大小、字體大小、可見性與基礎 A11y 觀察

## 執行摘要
- 已能開啟 dev server 並以自動化瀏覽器載入首頁與 `/login`。
- 嘗試以提供的 `test@demo.com / 123456` 填寫登入表單並提交，但未偵測到登入成功（頁面未顯示登入後標記或使用者識別字串）。可能原因：後端驗證未啟用、CORS / API endpoint 未正確設定、或測試帳號不存在。

## 主要發現
- meta viewport：存在（通過）。
- 水平捲軸 / 過寬元素：未發現（通過）。
- 字體大小：未發現小於 12px 的主要正文（通過）。
- 觸控目標（需修正）：
  - `切換主題` 按鈕 — 36x36（建議 >=48px）
  - `切換語言` 按鈕 — 36x36（建議 >=48px）
  - 首頁 `登入` 按鈕 — 62x40（高度 40 < 建議 48）

## 建議修正（優先順序）
1. **觸控目標擴大**：將小於 48px 的互動元件調整為至少 48x48 的可點擊區，或增加內外邊距（padding / hit area）。
2. **登入流程驗證**：提供可用的測試後端或確認 API endpoint（/api/auth 或 Firebase Auth 設定），以便自動化能登入並檢測受保護頁面。
3. **按鈕焦點樣式**：使用 `ring-1 ring-zinc-200/50 dark:ring-white/10` 與 `ring-offset-2` 提升鍵盤焦點可視性；active 狀態加上 `active:scale-95 transition duration-150`。

## 測試資產（截圖）
- 自動化截圖暫存路徑（機器上）：
  - C:\Users\122sp\AppData\Local\Temp\playwright-mcp-output\1773075348903\page-2026-03-09T16-55-49-331Z.png

> 如果您要我把截圖存入 repo（例如 `reports/screenshots/`）並附入 PR，我可以把該檔案複製到專案並將報告補上相對路徑。

## 下一步選項
- A) 您提供可用的測試驗證（或啟用本機驗證 endpoint），我將登入並爬行受保護頁面（tabs & 子 tabs）並產生完整報告。  
- B) 我將把目前截圖複製進 `reports/screenshots/` 並產生 issue-ready 的修正清單與 PR 草稿。  

請回覆要選 A 還是 B，或直接提供可用測試憑證 / 後端設定細節。