# Architecture Index（Aligned to SSOT）

本目錄為 `docs/architecture/logic-overview.md` 的切片導覽索引。
本頁僅提供定位與審查入口；規則定義以 `logic-overview.md` 為唯一真相。

## Review Gate Baseline

- Mandatory Gate：`VS0~VS8` + `D1~D26` + `TE1~TE6` + `S1~S6` + `L/R/A`
- Extension Gate：`D27`（僅 document-parser / finance-routing 變更必審）

## Vertical Slices（VS0~VS8）

| Slice | Scope | Doc |
|---|---|---|
| VS0 | Shared Kernel（契約中心） | [slices/shared-kernel.md](./slices/shared-kernel.md) |
| VS1 | Identity | [slices/identity.md](./slices/identity.md) |
| VS2 | Account | [slices/account.md](./slices/account.md) |
| VS3 | Skill | [slices/skill.md](./slices/skill.md) |
| VS4 | Organization | [slices/organization.md](./slices/organization.md) |
| VS5 | Workspace | [slices/workspace.md](./slices/workspace.md) |
| VS6 | Scheduling | [slices/scheduling.md](./slices/scheduling.md) |
| VS7 | Notification | [slices/notification.md](./slices/notification.md) |
| VS8 | Semantic Graph（The Brain） | [slices/semantic-graph.md](./slices/semantic-graph.md) |

## Infrastructure / Cross-cutting

| Layer / Authority | Scope | Doc |
|---|---|---|
| L4 | IER（事件路由） | [slices/ier.md](./slices/ier.md) |
| L5 | Projection Bus（唯讀投影） | [slices/projection-bus.md](./slices/projection-bus.md) |
| D26 Authority | Global Search（唯一跨域搜尋） | [slices/global-search.md](./slices/global-search.md) |
| D26 Authority | Notification Hub（唯一副作用出口） | [slices/notification-hub.md](./slices/notification-hub.md) |

## Semantic Tag Entities（TE1~TE6）

- TE1 `tag::user-level`
- TE2 `tag::skill`
- TE3 `tag::skill-tier`
- TE4 `tag::team`
- TE5 `tag::role`
- TE6 `tag::partner`

## Rule Anchors（Quick)

- `D1~D12` 路徑與依賴邊界
- `D13~D20` 契約治理
- `D21~D23` VS8 語義治理
- `D24~D25` Firebase ACL 邊界
- `D26` Cross-cutting Authorities
- `S1~S6` Outbox / Version / Read / Staleness / Resilience / Token

## SSOT Link

- Full spec: [logic-overview.md](./logic-overview.md)
