---
description: "Serena 工具（Serena tools）使用提示與 Copilot Custom Instructions 範本，供倉庫內 agent 與開發者參考。"
applyTo: "**/*"
---

目的
- 提供在本專案中撰寫與使用 Copilot / Serena 相關自訂指示 (custom instructions) 的範例與守則。

參考資料
- Serena 工具說明： https://oraios.github.io/serena/01-about/035_tools.html
- VS Code Copilot Custom Instructions 指南： https://code.visualstudio.com/docs/copilot/customization/custom-instructions

基本原則（必讀）
- 遵守 VS Code 的 Custom Instructions 指引與隱私規範，避免在指示中暴露密鑰或敏感資料。
- 指示文件以繁體中文（zh-TW）為主，必要時雙語（en / zh-TW）並保持 key 一致。
- 所有 repo 級的說明檔放置於 `.github/instructions/`，並使用本檔案首段的 YAML frontmatter（`description`、`applyTo`）以利自動化工具辨識。
- 針對自動化 agent（如 Serena 工具）應明確列出允許使用的工具、範圍與限制，避免未授權的外部呼叫。

撰寫要點（Checklist）
- **用途說明**：一句話說明此 custom instruction 的目標與適用情境。
- **上下文與限制**：列出可用資料、不可用資料，以及安全/隱私限制（例如：不得回傳 secrets、不得自動推送到遠端）。
- **範例互動**：提供 2–3 個示例 prompt 與預期回應格式。
- **回應格式**：如果需要機器可解析的輸出（JSON、表格），請明確示範 schema。
- **語言與風格**：指定回答語言（本 repo 預設 zh-TW）、口吻（簡潔、技術性）、程式碼風格（TypeScript、UTF-8）。
- **驗證步驟**：提供最小手動驗證步驟（例如：`npm run check`、`npm run dev` 之類的 repo 檢查指令）。

範例：repo 級 custom instruction 範本
---
description: "Repo: Serena tools 使用提示 — 限定 agent 可見的操作範圍與範例互動"
applyTo: "**/*"

內容（範例）
- Purpose: 本指示提供 Serena agent 在本 repo 中可用的工具清單、交互範例、及安全限制。
- Tools Allowed: Serena tooling (see https://oraios.github.io/serena/01-about/035_tools.html)，以及本 repo 的內部 file-read/file-write API。
- Restrictions: 不得請求、回傳或嵌入任何形式的密鑰或個人憑證；任何會變更遠端狀態的操作必須先取得明確人類授權。
- Language: 回應使用繁體中文（zh-TW）。
- Examples:
  - User: "依據 Serena 工具，列出可用的 parser 與用途。"
    Assistant: "列出格式化的清單，包含每個 parser 的短描述與建議使用場景。"
  - User: "請幫我產生一個符合 repo 規範的 custom instruction 範本，用於代碼審查助理。"
    Assistant: "回傳 YAML frontmatter 與內容片段，並標註需要人類確認的部分。"

安全與合規
- 永遠不要將敏感資訊寫入指示檔；建議把環境變數與密鑰放在系統層級的 secret manager 或 `.env`，但不要在指示中展示其值。
- 如果需要外部 API（例如 Context7 或其他 MCP），在指示中明確要求人類提供 API key 並描述如何安全地注入（例如：環境變數名稱、CI secret）。

維護與更新
- 若 Serena 官方文件變更，請更新本檔並在 `CHANGELOG.md` 記錄變更摘要與來源連結。
- 建議每半年檢視一次本說明檔是否仍符合 VS Code custom-instructions 指南。

問題回報
- 發現本範本或守則有錯誤或不明確之處，請開 issue 並標記 `area:docs` 與 `pkg:serena`。
