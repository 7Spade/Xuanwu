---
name: xuanwu-serena
description: Serena-first optimization workflow for Xuanwu customizations.
argument-hint: "Goal, scope, constraints, acceptance criteria"
agent: xuanwu-serena-autonomous
model: GPT-5.3-Codex
tools:
  - io.github.upstash/context7/*
  - sequentialthinking/*
  - software-planning/*
  - oraios/serena/*
---

# Xuanwu Serena Prompt

Run this workflow in order and do not skip steps.

## Required Sequence

1. 啟動前檢查
- 確認 `.vscode/mcp.json` 可呼叫下列 MCP：`sequentialthinking`、`software-planning`、`oraios/serena`、`io.github.upstash/context7`。

2. 強制思考與規劃（必做）
- 先以 `sequentialthinking` 建立一個簡短風險感知計畫（包含步驟與取捨）。
- 再以 `software-planning` 新增/記錄要執行的 TODO（以最小範圍為原則）。

3. Serena 初始化
- 呼叫 `oraios/serena` 的 `initial_instructions` 與 `check_onboarding_performed`（如未完成，按其回傳流程完成 onboarding）。
- 執行時，明確以 `sequentialthinking` 與 `software-planning` 的輸出作為 Serena 的執行基礎。

4. 代碼產出與驗證策略
- 若 `oraios/serena` 產生代碼或變更，必須回傳一個 **代碼準確度評估值（0-100）**。
- 如果評估值 < 100，立即用 `io.github.upstash/context7` 查詢相關來源與最佳實踐，補足說明並附上來源 URL。補強後再回傳最終建議。

5. 實作與回報
- 僅執行最小必要修改，遵守專案架構與 i18n 規範。
- 最終輸出應包含：簡短任務重述、採取步驟、變更檔案清單（相對路徑）、以及任何外部參考 URL（若使用 Context7）。

## Output Contract

Use this exact section order:

1. `Task Restatement`
2. `Scope`
3. `Context7 Findings`
4. `Sequential Plan`
5. `Implemented Changes`
6. `Validation`
7. `Residual Risks`

## Self-Test Checklist

- Confirm `.vscode/mcp.json` has `io.github.upstash/context7`, `sequentialthinking`, and `oraios/serena`.
- Confirm `initial_instructions` and `check_onboarding_performed` are callable.
- Confirm guidance coverage remains explicit for React, Next.js (including parallel routes), Firebase (Firestore and Storage), and development/testing workflows across `.github/agents`, `.github/instructions`, `.github/prompts`, and `.github/skills` when relevant.
- If any required tool is unavailable, report failed call and continue with a conservative fallback.

## References

- Workspace instructions: [copilot-instructions](../copilot-instructions.md)
- Serena autonomy rules: [xuanwu-serena-autonomy.instructions.md](../instructions/xuanwu-serena-autonomy.instructions.md)
- Bootstrap skill: [xuanwu-serena-bootstrap](../skills/xuanwu-serena-bootstrap/SKILL.md)
- VS Code custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- VS Code prompt files: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- VS Code custom agents: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- VS Code agent skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
