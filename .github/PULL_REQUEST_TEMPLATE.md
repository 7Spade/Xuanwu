## 📝 變更描述
## 🏗️ 架構檢查 (VSA)
- [ ] **Vertical Slice**: 變更是否限制在特定的 `src/features/{slice}` 內？
- [ ] **Public API**: 跨 Slice 的引用是否僅透過 `index.ts`？
- [ ] **Next.js 15**: 是否使用了 Server Actions 代替 API Routes (除非必要)？
- [ ] **Client Boundaries**: 是否正確標註 `"use client"` 且僅用於葉子節點？

## 🧭 Mermaid 前置邊界驗證（Boundary-First）
- [ ] **L1-L3 邊界完成**: 平台/工作區/資源邊界已確認並可追溯
- [ ] **L4 子資源完成**: owner/scope/parent_id 規則已明確
- [ ] **L5 子行為完成**: 狀態機、守衛、事件輸出已定義
- [ ] **L6-L9 已落檔**: 領域模型、契約、應用服務、基礎設施文件已同步
- [ ] **Mermaid 為結果**: 圖是邊界驗證結果，不是需求探索草圖

> 規則：Serena 能做高品質 Mermaid 的前提，是先做架構邊界驗證，不是直接畫圖。

## 📸 畫面截圖 / 錄影 (如有 UI 變更)
## 🧪 測試與驗證
- [ ] `npm run lint` 已通過
- [ ] `npm run typecheck` 已通過
- [ ] 在 `Parallel Routes` (如 @sidebar) 渲染正常

## 🔗 關聯 Issue
Closes #```

### 💡 專業提示：
將這些檔案推送到 GitHub 後，當你使用 **GitHub Copilot Workspace** 或 **Agent Task** 時，AI 會自動掃描這些模板中的內容來對齊它的「開發計劃」。特別是 PR 模板中的「架構檢查」部分，能有效提醒 AI 在撰寫代碼時不要違反 `src/features` 的封閉性規則。