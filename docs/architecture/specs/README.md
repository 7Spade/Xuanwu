# specs/ — L7 契約層 + 功能規格

> **層級職責**：定義 API schema、Command/Query payload 型別、領域事件 payload、跨服務契約版本，以及功能性需求規格（feature spec）。
> L7 是系統邊界的顯式契約，所有對外介面都必須在此層登記。

---

## 設計原則

- 契約一旦對外發布即需版本化（`v1/`, `v2/` prefix 或 field-level versioning）。
- 命令（Command）必須包含：`commandType`、`workspaceId`、`actorId`、`payload`、`timestamp`。
- 事件（DomainEvent）必須包含：`eventType`、`aggregateId`、`version`、`occurredAt`、`payload`。
- Query 結果型別以 `*View` 命名，禁止洩漏內部聚合結構。

---

## 本資料夾文件

| 文件 | 狀態 | 說明 |
|------|------|------|
| `contract-spec.md` | ✅ 已建立 | L7 API schema / 事件 payload / Command-Query 型別清單 |
| `resource-attribute-matrix.md` | ✅ 已建立 | 20 種資源型別欄位矩陣，含 scope 與 dual-ownership |
| `resource-relationship-graph.md` | ✅ 已建立 | 資源關聯圖：parent-child tree、dependency graph、skill graph |
| `org-workspace-feed-architecture.md` | ✅ 已建立 | 組織瀑布流（post/post_media/feed_projection）架構規格 |
| `scheduling-assignment-architecture.md` | ✅ 已建立 | 排程 + 指派功能（schedule_item/assignment_record）架構規格 |

---

## 邊界驗證前置需求

在建立 `contract-spec.md` 前，請確認以下文件已通過驗證：

- ✅ `../models/domain-model.md` (L6) — 聚合根邊界已確定，可持續迭代契約型別

---

## 設計備用記憶參照

以下 Serena 記憶檔已包含各規格的設計前草稿：

| Spec 文件 | 對應 Serena 記憶 |
|-----------|-----------------|
| `resource-attribute-matrix.md` | `.serena/memories/repo/spec_resource_attribute_matrix.md` |
| `resource-relationship-graph.md` | `.serena/memories/repo/spec_resource_relationship_graph.md` |
| `org-workspace-feed-architecture.md` | `.serena/memories/repo/spec_org_workspace_feed.md` |
| `scheduling-assignment-architecture.md` | `.serena/memories/repo/spec_scheduling_assignment.md` |
