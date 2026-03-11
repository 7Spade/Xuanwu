# [索引 ID: @MAP] 00 - Architecture Index

本索引提供架構文件最短導覽。判讀順序固定如下：

1. `00-logic-overview.md`：架構拓撲 SSOT（鏈路、層位、邊界、裁決原則）。
2. `02-governance-rules.md`：規則正文 SSOT（RULESET / FORBIDDEN / 審查門檻）。
3. `03-infra-mapping.md`：路徑與 Adapter 對照 SSOT。
4. `01-logical-flow.md`：可讀性視圖（流程圖與閱讀路徑）。

若文件間有衝突，依下列優先序裁決：

`00-logic-overview.md` > `02-governance-rules.md` > `03-infra-mapping.md` > `01-logical-flow.md`

## 三條主鏈（Canonical Chains）

- 寫鏈：`L0 -> L0A(CMD_API_GW) -> L2 -> L3 -> L4 -> L5`
- 讀鏈：`L0/UI -> L0A(QRY_API_GW) -> L6 -> L5`
- Infra 鏈：
  - A 路（Client SDK）：`L3/L5/L6 -> L1(SK_PORTS) -> L7-A -> L8`
  - B 路（Admin SDK）：`L0/L2 -> L7-B(functions) -> L8`

## 語義核心協議三段鏈（SSOT Reference）

> 權威序列圖：[`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`](../../Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md)
> （本節為索引摘要；詳細步驟編號、fail-closed 規則、欄位契約以上述 SSOT 為準）

| Phase | 名稱 | 關鍵參與者 |
|-------|------|------------|
| Phase 0 | 核心啟動（Kernel Bootstrap） | VS0 → D3 types；Admin → L8 ontology；D3 → L8 tags / profile / task |
| Phase 1 | 寫入鏈（Write Chain） | UI → L0A → L2 → L3 → L8[FI-002] → L10[embedding] → L4 → L5[LANE] |
| Phase 2 | 智慧匹配（Intelligent Matching） | UI → L0A → L2 → L3 → L10 → Tool-S → Tool-M[E8] → Tool-V[GT-2] → L0B → L3 → L4 → L4A[Who/Why/Evidence/Version/Tenant] → L5 → L3 → L8[BF-1] |
| Phase 3 | 讀取鏈（Read Chain） | L3 → L5 → UI；UI → L0A → L6 → L5 → UI |

### 本索引未列之關鍵參與者（補充說明）

| 識別符 | 角色說明 |
|--------|----------|
| `VS0` | 共用核心（Kernel / SDK）——D3 types 與 contracts 注入來源 |
| `L0A` | CQRS 閘道（API Ingress）——CMD 與 QRY 雙向入口 |
| `L0B` | Server Action 串流橋接——Phase 2 推理軌跡回傳 UI（Steps 2.8-2.9） |
| `L4A` | 語義決策稽核切片——持久化 Who/Why/Evidence/Version/Tenant（Step 2.12） |
| `L10` | Genkit AI 編排器——驅動 Tool-S / Tool-M / Tool-V 呼叫序列 |
| `Tool-S` | `search_skills`——語義查詢工具（B1 Read-only） |
| `Tool-M` | `match_candidates`——向量查詢工具（E8 fail-closed，tenantId 強綁定） |
| `Tool-V` | `verify_compliance`——資格硬過濾工具（GT-2 fail-closed） |

## 架構文件

- `docs/architecture/00-logic-overview.md`
- `docs/architecture/01-logical-flow.md`
- `docs/architecture/02-governance-rules.md`
- `docs/architecture/03-infra-mapping.md`
- `docs/architecture/99-checklist.md`

## Slice 與不變量

- `docs/architecture/03-Slices/`
- `docs/architecture/04-Invariants/`
- `docs/architecture/06-DecisionLogic/`

### Auxiliary Slices（非 VS 編號）

- `global-search.slice`：跨域搜尋權威出口（D26）。
- `portal.slice`：門戶殼層狀態與組裝橋接。

### Slice 索引（VS1~VS9）

- `VS1`: `docs/architecture/03-Slices/VS1-Identity/`
- `VS2`: `docs/architecture/03-Slices/VS2-Account/`
- `VS3`: `docs/architecture/03-Slices/VS3-Skill/`
- `VS4`: `docs/architecture/03-Slices/VS4-Organization/`
- `VS5`: `docs/architecture/03-Slices/VS5-Workspace/`
- `VS6`: `docs/architecture/03-Slices/VS6-Scheduling/`
- `VS7`: `docs/architecture/03-Slices/VS7-Notification/`
- `VS8`: `docs/architecture/03-Slices/VS8-SemanticBrain/`
  - `architecture.md`：目標十層 `centralized-*` 架構、模組對應表、API 邊界。
  - `architecture-build.md`：逐階段目錄遷移實施計畫。
- `VS9`: `docs/architecture/03-Slices/VS9-Finance/`

實作現況補充（程式碼存在但不編入 VS1~VS9）：

- `src/features/global-search.slice/`
- `src/features/portal.slice/`

## 審查入口

- PR 審查以 `docs/architecture/99-checklist.md` 為執行清單。
- 任何規則調整必須先改 `02-governance-rules.md`，再回填 `00/01/03` 引用。

## 程式碼參考入口（Repomix Skill）

- `.github/skills/xuanwu-skill/SKILL.md`：Xuanwu codebase reference skill 入口（VS Code 主動載入）。
- `.github/skills/xuanwu-skill/references/summary.md`：摘要與統計（先讀）。
- `.github/skills/xuanwu-skill/references/project-structure.md`：目錄與檔案定位。
- `.github/skills/xuanwu-skill/references/files.md`：程式內容檢索（`## File: <path>`）。

用途：當 `docs/architecture/*` 需要「從程式碼回寫 capability」時，先用上述入口定位與驗證，再更新對應 slice 文件。

目前 skill 統計基線（2026-03-11）：`627 files | 11,519 lines`。
