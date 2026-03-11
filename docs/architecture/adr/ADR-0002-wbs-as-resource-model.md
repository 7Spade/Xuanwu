# ADR-0002：WBS 任務項目以 Resource 模型建模

- **Status**: Accepted
- **Date**: 2026-03-12
- **Deciders**: Architecture Team（xuanwu-commander）

---

## Context

WBS（Work Breakdown Structure）任務項目（Epic/Feature/Story/Task/Sub-task）是否應建立獨立資料表或納入通用 Resource 模型？兩種方向均有先例。

---

## Decision

WBS 所有層級項目均以 **通用 Resource 模型**（`resource_items` 表）建模，以 `sub_type` discriminator 區分層級（epic / feature / story / task / subtask）。

---

## Rationale

評估 WBS 是否屬於「資源」的六項依據，均得出肯定結果：

| 評估面向 | 結論 |
|----------|------|
| 所有權邊界 | 皆屬特定工作區，攜帶 `workspaceId` scope |
| 生命週期管理 | 有 CRUD、歸檔、還原、版本記錄 |
| 權限控制 | 依 WSOwner/WSAdmin/WSMember/WSViewer 角色有不同讀寫限制 |
| 層級結構 | Epic → Feature → Story/Task → Sub-task 為樹狀資源模型（`parent_id` 自參照）|
| 跨資源關係 | 依賴關係（Dependency）= 資源間關聯邊（`resource_relations` 表）|
| 進度狀態 | 狀態/完成度屬資源屬性欄位，非獨立系統 |

採用通用資料模型的關鍵收益：
- 三表模型（`resource_types` + `resource_items` + `resource_relations`）可統一處理所有 20 種資源型別，包含未來擴展型別。
- 「進度儀表板」為工作區層的聚合視圖，底層資料來自各 Resource 的狀態欄位，無需額外進度表。

---

## Consequences

**正面影響**：
- 統一查詢介面；所有資源操作共用 Repository 模式。
- 新增資源型別只需在 `resource_types` 登記，不需新增 DB 表。

**負面影響**：
- `resource_items` 表欄位為 JSON extension（`extension_fields`），型別安全需在 L7 Contract 層靠 schema validation 保障。
- `sub_type` discriminator 需配合嚴格的 L4 邊界驗證，避免跨 sub_type 行為誤用。

---

## Alternatives Considered

| 選項 | 拒絕原因 |
|------|---------|
| 為每個 WBS 層級建立獨立表（epic_items, feature_items...）| 欄位高度重複；跨層級查詢需多次 JOIN |
| 專屬 WBS 服務（微服務分割）| 過度工程；在 MVP 階段無必要；增加跨服務一致性複雜度 |

---

## References

- [L3 Resource Use Case 圖](../use-cases/use-case-diagram-resource.md)
- [L4 Sub-Resource 邊界定義](../use-cases/use-case-diagram-sub-resource.md)
- [L6 Domain Model](../models/domain-model.md)
