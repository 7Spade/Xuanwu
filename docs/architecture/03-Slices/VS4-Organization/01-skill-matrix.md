# [索引 ID: @VS4-Skill] VS4 Organization - Skill Matrix

## Scope

VS4 只管理「技能需求與門檻」，不管理 XP 寫入。

## Ownership

- `#11`: XP 寫入屬 VS3；VS4 僅定義門檻與認可規則。
- `#12`: Tier 為推導值，不存 DB。

## Recognition Rules

- `org-skill-recognition.aggregate` 管理「技能認可門檻」與啟用狀態。
  - **權力歸屬**：門檻值由 VS4 依組織治理授權設定（VS4 擁有決策權；VS3 只負責 XP 寫入 [#11]）。
  - **層級與依賴規則**：VS4 ≠ VS3，兩者各屬獨立 BC，不可跨層操作。
  - **邊界與上下文**：組織政策屬 VS4 內部狀態，外部不得直接讀寫。
- recognition 變更需事件化輸出，供其他 slice 訂閱。

## Snapshot & Freshness

- MUST: 組織技能快照依賴 `tag-snapshot` 與 S4 新鮮度契約。
- MUST: `TAG_MAX_STALENESS <= 30s`。
- FORBIDDEN: 業務邏輯直讀 VS8 adjacency 或自行算語義相似度。

## SSOT Phase 對齊（Phase Alignment）

| Phase | 步驟 | VS4 Skill Matrix 角色 |
|-------|------|----------------------|
| Phase 0 (0.1/0.2) | Tag Ontology 建立 | VS4 Skill Matrix 的閾值（recognitionThreshold）依賴 VS8 定義的 skill tier slugs；Phase 0 tag bootstrap 完成後方可建立矩陣 |
| Phase 2 (2.6, Tool-M) | 向量匹配候選池 | `ORG_SKILL_MATRIX_VIEW` 是 Tool-M（`match_candidates`）篩選組織合格候選人的資料視圖 |
| Phase 2 (2.7, Tool-V) | 資格驗證 | Skill matrix 中的 tier 和 recognitionThreshold 是 Tool-V（`verify_compliance`）資格硬過濾的依據 |

**E8**：Skill Matrix 查詢必須帶 tenantId；跨組織矩陣讀取一律 fail-closed。
