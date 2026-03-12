# docs/architecture — 架構文件資料夾樹

> **導覽原則**：本資料夾採 L1→L9 層級流，每層文件驗證通過後才可進入下一層設計或繪圖。
> 高品質 Mermaid 的前提是先完成架構邊界驗證，不是直接畫圖。
> 在滿足邊界正確性後，採用奧卡姆剃刀：優先保留依賴最少、責任最清楚的實作路徑。

---

## 資料夾樹全覽

```
docs/architecture/
│
├── README.md                                       ← 本檔，資料夾樹導覽
│
├── use-cases/                                       ← Use Case 文件 (L1–L5)
│   ├── use-case-diagram-saas-basic.md              ✅ L1  平台 / 個人 / 組織層
│   ├── use-case-diagram-workspace.md               ✅ L2  工作區層
│   ├── use-case-diagram-resource.md                ✅ L3  資源層（R1–R53）
│   ├── use-case-diagram-sub-resource.md            ✅ L4  子資源層（SR01–SR54）
│   └── use-case-diagram-sub-behavior.md            ✅ L5  子行為層（SB01–SB54，4 狀態機）
│
├── models/                                         ← L6  領域模型層
│   ├── README.md
│   └── domain-model.md                             ✅  ER 圖 + 4 聚合根邊界 + XP 等級表
│
├── specs/                                          ← L7  契約層 + 功能規格
│   ├── README.md
│   ├── contract-spec.md                            ✅  Command/Event Registry（L5 → L7 完整映射）
│   ├── resource-attribute-matrix.md                ✅  20 種資源型別欄位矩陣 + dual-ownership
│   ├── resource-relationship-graph.md              ✅  Parent-Child 樹 / DAG / 技能圖 / XP 等級表
│   ├── org-workspace-feed-architecture.md          ✅  Org/Workspace/Feed 架構 + activeContext 模型
│   └── scheduling-assignment-architecture.md       ✅  排程 + 指派 + SkillMint 四階段 + XP Saga
│
├── blueprints/                                     ← L8  應用服務層
│   ├── README.md
│   └── application-service-spec.md                 ✅  Command Handler 骨架 + 3 核心 Saga 設計
│
├── guidelines/                                     ← L9  基礎設施層
│   ├── README.md
│   └── infrastructure-spec.md                      ✅  Repository / EventBus / IdempotencyStore / StorageAdapter
│
├── diagrams/                                       ← 圖表匯出資源 (PNG / SVG / Mermaid 快照)
│   └── README.md
│
├── patterns/                                       ← 架構模式手冊（how-to）
│   └── README.md
│
├── glossary/                                       ← 架構術語表（ubiquitous language）
│   └── README.md
│
└── adr/                                            ← Architecture Decision Records
    └── README.md
```

---

## 層級職責速查

| 層 | 資料夾 / 檔案 | 圖型 | 核心關注點 |
|----|--------------|------|-----------|
| L1 | `use-cases/use-case-diagram-saas-basic.md` | Use Case | 平台邊界、組織/個人情境、訂閱 gating |
| L2 | `use-cases/use-case-diagram-workspace.md` | Use Case | 工作區 ACL、四級角色、activeContext scope |
| L3 | `use-cases/use-case-diagram-resource.md` | Use Case | 資源型別、WBS 樹、技能門檻、依賴圖 |
| L4 | `use-cases/use-case-diagram-sub-resource.md` | Use Case | 子資源 owner scope、parent_id 約束、讀/寫分離 |
| L5 | `use-cases/use-case-diagram-sub-behavior.md` | Use Case / State | 原子行為、precondition / postcondition、audit log |
| L6 | `models/domain-model.md` | ER / Aggregate | 聚合根邊界、值物件、invariant、跨聚合事件 |
| L7 | `specs/contract-spec.md` | Schema / Contract | API schema、事件 payload、command/query 型別、版本 |
| L8 | `blueprints/application-service-spec.md` | Sequence / Flow | Command Handler、Saga、Query Handler 編排 |
| L9 | `guidelines/infrastructure-spec.md` | Component / Infra | Repository、EventBus Adapter、DB migration、idempotency |

---

## 資料夾用途說明

| 資料夾 | 用途 |
|--------|------|
| `models/` | 領域實體 ER 圖、聚合根設計；對應 L6 |
| `specs/` | 契約定義 + 功能規格；對應 L7 及跨層 feature spec |
| `blueprints/` | 應用服務藍圖；對應 L8，含 Saga 流程圖 |
| `guidelines/` | 基礎設施實作準則；對應 L9，含 DB schema 策略 |
| `diagrams/` | 匯出的圖表圖片 (PNG/SVG)，不含原始文字定義 |
| `patterns/` | 架構模式實作手冊（How-to），強調邊界驗證先於 Mermaid |
| `glossary/` | 架構術語與定義（Ubiquitous Language） |
| `adr/` | Architecture Decision Records（決策紀錄），格式：`ADR-NNNN-title.md` |

---

## 邊界驗證順序（Serena 繪圖前必讀）

```
L1 平台/組織邊界  ✅
  └── L2 工作區邊界  ✅
        └── L3 資源邊界  ✅
              └── L4 子資源邊界  ✅ → use-cases/use-case-diagram-sub-resource.md
                    └── L5 子行為邊界  ✅ → use-cases/use-case-diagram-sub-behavior.md
                          └── L6 領域模型  ✅ → models/domain-model.md
                                └── L7 契約  ✅ → specs/contract-spec.md
                                      └── L8 應用服務  ✅ → blueprints/application-service-spec.md
                                            └── L9 基礎設施  ✅ → guidelines/infrastructure-spec.md
```

> ✅ = 已建立並通過邊界驗證　　🔲 = 待建立

---
