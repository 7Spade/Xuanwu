# Copilot / Agent 配置遵循指南

本倉庫 `.github/` 目錄下之所有 Copilot、custom-instructions、agent、MCP、hooks、plugin 等相關設定
必須依據 Microsoft 官方文件建立與維護。請維護者在變更任何 `.github` 內設定時，先確認下列官方文件的要求並遵循其建議與安全實作。

必須參照的官方文件：

- https://code.visualstudio.com/docs/copilot/setup
- https://code.visualstudio.com/docs/copilot/best-practices
- https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- https://code.visualstudio.com/docs/copilot/customization/prompt-files
- https://code.visualstudio.com/docs/copilot/customization/custom-agents
- https://code.visualstudio.com/docs/copilot/customization/agent-skills
- https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- https://code.visualstudio.com/docs/copilot/customization/hooks
- https://code.visualstudio.com/docs/copilot/customization/agent-plugins
- https://code.visualstudio.com/docs/copilot/copilot-smart-actions#copilot-guides-articles
- https://code.visualstudio.com/docs/copilot/reference/copilot-settings
- https://code.visualstudio.com/docs/copilot/reference/mcp-configuration
- https://code.visualstudio.com/docs/copilot/reference/workspace-context

維護檢查要點：

- 確認不在設定檔或指示檔中硬編輯或洩露任何機密（API key、token、密碼等）。
- 對會改變執行環境或自動化流程的更動（例如新增 MCP server、agent plugin），應附上變更說明與審核紀錄。
- 更新本檔案以記錄任何新增的相關官方文件或補充指引。

若需要，我可以協助把倉庫內現有 `.github` 設定檔逐一比對上述文件並產出合規檢查清單。
