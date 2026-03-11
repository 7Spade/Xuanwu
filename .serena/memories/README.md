# .serena/memories — 記憶體庫檔案樹規劃

> **用途**：本檔定義 Serena 記憶體庫（`.serena/memories/`）的主題分類與命名慣例，
> 供所有代理人在 `serena-write_memory` / `serena-read_memory` 時保持一致的路徑策略。
>
> 記憶體名稱以 `/` 分隔主題層級，例如 `architecture/layer-hierarchy`。
> 只保留「不因單次任務變動而失效」的長效事實。

---

## 記憶體庫檔案樹全覽

```
.serena/memories/
│
├── README.md                              ← 本檔，記憶體庫導覽與命名規範
│
├── architecture/                          ← 架構層級、邊界、SSOT 位置
│   ├── layer-hierarchy                    ← L1→L9 層級流與每層職責速查
│   ├── feature-slices                     ← 所有 feature slice 名稱與簡介
│   ├── domain-model                       ← 核心領域實體與聚合根邊界
│   ├── ssot-locations                     ← 各 SSOT 文件的正確路徑
│   └── adr-decisions                      ← 重要 ADR 決定摘要（ADR-0001~0005）
│
├── copilot/                               ← GitHub Copilot 客製化資產目錄
│   ├── agents-catalog                     ← 所有 .github/agents/*.agent.md 清單與用途
│   ├── prompts-catalog                    ← 所有 .github/prompts/*.prompt.md 斜線命令對照
│   ├── skills-catalog                     ← 所有 .github/skills/ 技能名稱與觸發條件
│   └── instructions-catalog              ← 所有 .github/instructions/ 範圍與套用規則
│
├── tooling/                               ← 建置、測試、Lint 指令
│   ├── build-commands                     ← npm run build / typecheck / check
│   ├── test-commands                      ← npx vitest run 用法與路徑慣例
│   ├── lint-commands                      ← eslint.config.mts、npm run lint
│   └── dev-commands                       ← npm run dev（port 9002）
│
├── conventions/                           ← 程式碼慣例與命名規範
│   ├── typescript-patterns                ← TS 5.x 型別、async 錯誤、unknown 邊界
│   ├── naming                             ← PascalCase / camelCase / UPPER_SNAKE / kebab-case
│   ├── file-structure                     ← feature slice 內部佈局（index / types / actions / queries）
│   └── i18n                               ← en.json + zh-TW.json 雙語鍵值同步規則
│
├── features/                              ← 各 feature slice 的關鍵事實
│   ├── account-slice                      ← account.slice 公開 API 與邊界
│   ├── workspace-slice                    ← workspace.slice 公開 API 與邊界
│   ├── organization-slice                 ← organization.slice 公開 API 與邊界
│   ├── identity-slice                     ← identity.slice（Auth）公開 API
│   ├── finance-slice                      ← finance.slice 公開 API
│   ├── skill-xp-slice                     ← skill-xp.slice XP Saga 機制
│   ├── workforce-scheduling-slice         ← workforce-scheduling.slice 排程架構
│   ├── semantic-graph-slice               ← semantic-graph.slice VertexAI 整合
│   ├── notification-hub-slice             ← notification-hub.slice 通知管線
│   ├── global-search-slice                ← global-search.slice 跨領域搜尋
│   └── portal-slice                       ← portal.slice Shell 狀態橋接
│
├── infrastructure/                        ← 部署與基礎設施設定
│   ├── firebase-setup                     ← Firebase 專案設定、Firestore、Auth
│   ├── nextjs-config                      ← next.config.ts 重要選項
│   └── deployment                         ← App Hosting / apphosting.yaml 設定
│
└── global/                                ← 跨專案通用規範（global/ 前綴保留給 store_memory）
    ├── java-style-guide                   ← （保留，目前不使用）
    └── ...
```

---

## 命名慣例

| 規則 | 說明 |
|------|------|
| 主題分隔 | 以 `/` 區隔層級，例如 `architecture/ssot-locations` |
| 檔名小寫 kebab | 使用小寫英文與連字號，不含副檔名 |
| 長效事實優先 | 只記錄「跨任務仍有效」的事實；任務特有暫存資訊不存入記憶體 |
| 禁止機密 | API 金鑰、密碼、token 一律不存入任何記憶體 |
| `global/` 前綴 | 僅用於 `store_memory` 工具的跨專案通用慣例 |

---

## 各主題寫入時機

| 主題路徑 | 建議寫入時機 |
|----------|-------------|
| `architecture/*` | 完成架構研究或發現 SSOT 變更後 |
| `copilot/*` | 新增、重命名、合併 agent/prompt/skill 後 |
| `tooling/*` | 驗證成功的建置或測試指令後 |
| `conventions/*` | 發現跨檔案一致的編碼慣例後 |
| `features/*` | 深入理解特定 slice 的公開合約後 |
| `infrastructure/*` | Firebase / Next.js / 部署設定有效確認後 |

---

## 參考資源

- Serena 記憶體工具：`serena-write_memory` / `serena-read_memory` / `serena-list_memories` / `serena-edit_memory` / `serena-delete_memory` / `serena-rename_memory`
- 知識圖譜（長期存儲）：`.memory/knowledge-graph.json`（使用 `memory-*` MCP 工具）
- Copilot 記憶體（跨對話）：`store_memory` 工具（使用 `global/` 前綴跨專案共用）
- Serena 專案設定：`.serena/project.yml`
