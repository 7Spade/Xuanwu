# 03-Slices

本目錄承載 VS1~VS9 的切片架構文件，並維護 auxiliary slices 的回寫規則。

- 共用規範：`00-slice-standard.md`
- 每個 VS 子目錄：聚焦該切片的寫路徑、讀路徑、不變量與禁止路徑
- 依賴方向：遵守單向鏈 `L0 -> L2 -> L3 -> L4 -> L5` 與 `L0/UI -> L6 -> L5`
- Finance 相關切片：`VS9-Finance/`（`A20`、`A21`、`A22`）
- Auxiliary slices（非 VS 編號）：`global-search.slice`、`portal.slice`

## SSOT 協議機制索引（Mechanism Cross-Reference）

> 本節依 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` 標示各 Phase 涉及的 Slice 與機制。
> 各 Slice 文件應以此為對齊基準，在 Write Path / Read Path 章節標示歸屬 Phase。

### Phase 0：核心啟動（Kernel Bootstrap）

| 參與 Slice | 職責說明 |
|------------|----------|
| `VS0`（Shared Kernel） | D3 types 與 contracts 注入；核心 SDK 初始化 |
| `VS8`（SemanticBrain） | tag ontology 建立（Admin → L8） |
| `VS2`（Account） | 初始 profile 建立（D3 → L8） |
| `VS5`（Workspace） | 初始 task setup（D3 → L8） |

### Phase 1：寫入鏈（Write Chain）

| 機制 | 說明 |
|------|------|
| `FI-002` | 單一 Firestore 交易保證（L3 → L8） |
| `D29` | TransactionalCommand 標記（L2 → L3） |
| `LANE` | 整合事件路由分流（Critical / Standard）（L4 → L5） |

涉及切片：VS1–VS9（所有業務寫入）；VS8 額外觸發 L10 embedding 寫入。

### Phase 2：智慧匹配（Intelligent Matching）

| 機制 | 說明 |
|------|------|
| `Tool-S`（search_skills） | 語義查詢，B1 Read-only |
| `Tool-M`（match_candidates） | 向量查詢，**E8 fail-closed**（tenantId 強綁定） |
| `Tool-V`（verify_compliance） | 資格硬過濾，**GT-2 fail-closed**（未通過即排除） |
| `L4A` Audit 欄位 | Who / Why / Evidence / Version / Tenant（Step 2.12） |

主要負責 Slice：`VS8`（SemanticBrain / L10 Genkit 流）、`L4A`（語義決策稽核切片）。

### Phase 3：讀取鏈（Read Chain）

| 機制 | 說明 |
|------|------|
| `L6` Query Gateway | 所有查詢請求入口（UI → L0A → L6 → L5） |
| `S2` Version Guard | 投影版本單調遞增守衛 |

涉及切片：所有對外暴露 Read Model 的 VS1–VS9。

> **文件對齊要求**：
> - 各 Slice 的 Write Path 文件應明確標示 FI-002 / D29 / LANE 歸屬。
> - 各 Slice 的 Read Path 文件應標示 Phase 3 對齊。
> - VS8 相關 Slice 的 Matching Path 應標示 Tool-S/M/V 呼叫序列與 E8/GT-2 fail-closed 規則。

## Code-backed 回寫基線

- 回寫來源固定先讀：`skills/SKILL.md`。
- 目錄定位使用：`skills/references/project-structure.md`。
- 能力檢索使用：`skills/references/files.md`（以 `## File: <path>` 驗證）。
