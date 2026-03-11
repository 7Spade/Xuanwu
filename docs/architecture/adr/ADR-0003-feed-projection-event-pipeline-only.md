# ADR-0003：feed_projection 寫入責任 — 僅限事件管線，禁止直接寫入

- **Status**: Accepted
- **Date**: 2026-03-12
- **Deciders**: Architecture Team（xuanwu-commander）

---

## Context

`feed_projection`（組織瀑布流投影）是將工作區貼文（`post`）聚合到 org scope 的讀模型。
設計時需決定：誰有權寫入 `feed_projection`？

候選方案：
1. **WSAdmin 直接寫入**：允許管理員手動控制瀑布流內容
2. **僅事件管線**：`PostPublished` 事件觸發系統自動寫入，人工不可直接修改讀模型

---

## Decision

`feed_projection` 的寫入**僅由事件管線執行**（`PostPublished` 事件 → SB22 系統行為）。

任何人工 Command 只能觸發 `PublishPostCommand`（SB20），不可直接寫入 `feed_projection`。

---

## Rationale

- `feed_projection` 是**投影（Projection）**，不是業務資源；它的存在只是為了加速 org scope 的讀取查詢。
- 允許手動寫入讀模型會產生資料不一致風險（寫入 source-of-truth 的 `post` 表後，投影可能不同步）。
- 事件管線寫入支援**冪等重試**（SB52 冪等守衛 + idempotency key），系統崩潰後可安全重建投影。

CQRS 原則：
- 寫側（Command Side）：`post` 是 aggregate root，`PublishPost` 是唯一寫入入口。
- 讀側（Query Side）：`feed_projection` 是 Read Model，只由事件觸發更新。

---

## Consequences

**正面影響**：
- 寫側和讀側職責清晰分離（CQRS）。
- `feed_projection` 可安全重建（從 `post` 事件流 replay）。
- 消除人工誤寫讀模型的安全風險。

**負面影響**：
- 投影更新有**最終一致性延遲**（事件管線處理時間）；前端需處理短暫不一致。
- 若事件管線故障，需有 Dead Letter Queue + 告警機制（L9 EventBus Adapter 責任）。

---

## Alternatives Considered

| 選項 | 拒絕原因 |
|------|---------|
| WSAdmin 直接寫 feed_projection | 破壞 CQRS；寫側 source-of-truth 與讀模型可能不同步 |
| 同步寫入（在 PublishPost Handler 內同步更新投影）| 將讀側耦合至寫側 Handler；影響寫入延遲；難以分層測試 |

---

## References

- [L3 R46 投影到組織瀑布流](../use-cases/use-case-diagram-resource.md)
- [L5 SB20/SB22 發布貼文與事件管線](../use-cases/use-case-diagram-sub-behavior.md)
- [org-workspace-feed-architecture.md](../specs/org-workspace-feed-architecture.md)
