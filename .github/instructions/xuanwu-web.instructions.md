---
description: Guidance and must-follow rules for React/Next.js, Firebase, and dev-test workflows.
applyTo: "src/**, .github/{agents,instructions,prompts,skills}/**/*"
---

# Xuanwu Web Instructions

這份說明提供在 `xuanwu` 倉庫中，針對 React / Next.js（含 App Router 與平行路由）、Firebase（Firestore 與 Storage）以及開發測試工作流的作者與 agent 必須遵守的規範。

基本規則：

- 不在 repo 中寫入任何機密（API keys、服務帳號等），請使用環境變數或 CI secret 管理。
- 所有前端 UI 字串必須使用 i18n key，並同步更新 `public/localized-files/en.json` 與 `public/localized-files/zh-TW.json`。
- Firebase 設定範例應提供範本檔 `.env.example` 或是文件，勿寫入實際憑證。
- Next.js App Router / 平行路由相關修改應遵守架構邊界（不要把大型第三方 wrapper 放入 feature slice）。
- 測試流程建議使用 Playwright（或等效工具）做 E2E，並在 CI 中加入 `npm run check` 及 `npm run test` 檢查。

Agent/Prompt 作者應：

- 在 frontmatter 明確列出所需 MCP tools（如 `io.github.upstash/context7`, `sequentialthinking`, `software-planning`, `oraios/serena`）。
- 在 skill/prompt 中加入明確的驗證步驟（Serena init、onboarding 檢查、get_errors 或本地 `npm run check`）。
