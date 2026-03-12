# Xuanwu Serena Project Memory Index

此文件夾存儲 Xuanwu 項目的結構化知識，幫助后续任務快速獲取上下文。

## 記憶文件結構

### 🏗️ 架構類 (Architecture/)
- `architecture/ddd-layers.md` — DDD 四層架構（Presentation → Application → Domain → Infrastructure）
- `architecture/feature-slices.md` — Feature Slice 邊界、依賴方向、公共 API
- `architecture/data-flow.md` — CQRS 分離、事件流、投影模式
- `architecture/ssot-references.md` — 單一信息源引用（docs/architecture/README.md、.memory/knowledge-graph.json）

### 🎯 域驅動設計 (DDD/)
- `ddd/value-objects.md` — WorkspaceId、TaskId、Money 等值對象
- `ddd/aggregates.md` — TaskEntity、WorkspaceAggregate 等聚合根
- `ddd/migration-status.md` — 漸進式 DDD 遷移進度追踪
- `ddd/ports-adapters.md` — ITaskRepository、IAuthService 等端口接口

### 💻 代碼模式 (Code-Patterns/)
- `code-patterns/imports.md` — 從 @/shared-kernel 導入、避免深層路徑
- `code-patterns/error-handling.md` — Result 模式、錯誤傳播
- `code-patterns/type-safety.md` — TypeScript 最佳實踐、類型推導
- `code-patterns/async-patterns.md` — Server Component 邊界、異步 API

### 🧪 測試實踐 (Testing/)
- `testing/vitest-setup.md` — vitest.config.ts 別名順序、組態細節
- `testing/playwright-e2e.md` — E2E 測試、瀏覽器自動化
- `testing/coverage-matrix.md` — 各功能切片的測試覆蓋狀態
- `testing/auth-fixtures.md` — 測試登入流程、TEST_AUTH_EMAIL/PASSWORD

### 🌍 國際化 (i18n/)
- `i18n/locale-keys.md` — UI 文本鍵命名約定、同步規則
- `i18n/sync-checklist.md` — public/localized-files/ 雙語同步檢查清單
- `i18n/taiwan-terminology.md` — 特定領域需要繁體中文的術語

### ⚡ 性能與優化 (Performance/)
- `performance/next-optimization.md` — Next.js 優化技巧、圖片/字體加載
- `performance/bundle-analysis.md` — 依賴分析、代碼分割策略
- `performance/runtime-metrics.md` — 核心 Web 指標、瓶頸追踪

### 🔐 安全性 (Security/)
- `security/secrets-management.md` — 環境變量、Firebase 規則、密鑰管理
- `security/auth-boundaries.md` — Firebase Auth 集成、授權檢查
- `security/data-protection.md` — Firestore 安全規則、敏感數據處理

### 🛠️ 工具鏈 (Tooling/)
- `tooling/build-commands.md` — npm run build、npm run dev、npm run test 等
- `tooling/lint-eslint.md` — ESLint 規則、自動修復、禁用規則的理由
- `tooling/firebase-setup.md` — Firebase 本地開發、模擬器設置
- `tooling/repomix-skill.md` — Repomix 代碼基礎技能、打包 CLI

### 📋 約定與最佳實踐 (Conventions/)
- `conventions/naming.md` — 檔案命名、變數命名、函數命名規則
- `conventions/file-encoding.md` — UTF-8 (無 BOM)、行尾符號
- `conventions/commit-messages.md` — Git 提交信息格式、PR 標題約定
- `conventions/documentation.md` — 模塊頭注釋、JSDoc 標準

### 🔄 決策記錄 (Decisions/)
- `decisions/architecture-decisions.md` — ADR：架構決策記錄
- `decisions/tech-stack-rationale.md` — 為什麼選擇 Next.js、TypeScript、Firebase
- `decisions/agent-routing.md` — 各代理人職責、何時調用誰

### 👥 現有代理人與技能 (Agents/)
- `agents/agent-roster.md` — xuanwu-commander、xuanwu-implementer 等的職責
- `agents/skill-registry.md` — breakdown-epic、ddd-architecture、x-framework-guardian

---

## 如何使用此記憶庫

### 讀取記憶
```bash
serena-read_memory("architecture/ddd-layers")
```

### 添加新記憶
發現新的架構事實、代碼模式或工具鏈細節後：
```bash
serena-write_memory("conventions/naming", "新的命名約定內容...")
```

### 更新現有記憶
當事實變化或發現過時信息時：
```bash
serena-edit_memory("testing/vitest-setup", "oldPattern", "newPattern")
```

### 刪除陳舊記憶
```bash
serena-delete_memory("decisions/outdated-decision")
```

---

## 記憶優先級

1. **高優先級** — 架構邊界、DDD 層級分離、安全規則
2. **中優先級** — 代碼模式、測試實踐、約定
3. **低優先級** — 工具命令、一次性決策

---

## 最後更新

- **日期**: 2026-03-12
- **Version**: 1.0
- **維護者**: Xuanwu Serena Agent Cluster

---

## 相關資源

- 📖 Serena 指示手冊：`.github/copilot-instructions.md`
- 🏗️ 架構 SSOT：`docs/architecture/README.md`
- 📚 知識圖譜：`.memory/knowledge-graph.json`
- 🎓 DDD 技能：`.github/skills/ddd-architecture/SKILL.md`
