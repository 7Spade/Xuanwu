# adr/ — Architecture Decision Records

> **用途**：記錄架構層級的決策（為何選擇 X 而非 Y）。每個 ADR 一旦「Accepted」即不可修改內文；若決策變更則建立新 ADR 並標記舊 ADR 為「Superseded」。

---

## 命名格式

```
ADR-NNNN-{kebab-case-title}.md
```

範例：
- `ADR-0001-bottom-layer-naming-infrastructure-vs-atomic.md`
- `ADR-0002-workspaceId-row-level-security.md`

---

## ADR 範本

```markdown
# ADR-NNNN: {Title}

- **Status**: Draft | Proposed | Accepted | Superseded by ADR-XXXX
- **Date**: YYYY-MM-DD
- **Deciders**: {roles or names}

## Context

{背景說明：為何需要做此決策}

## Decision

{決策內容：選擇了什麼}

## Consequences

{影響：正面與負面後果}

## Alternatives Considered

{被拒絕的選項與拒絕原因}
```

---

## 已記錄決策

| ADR | 標題 | 狀態 | 影響層 |
|-----|------|------|-------|
| [ADR-0001](ADR-0001-bottom-layer-naming-infrastructure-vs-atomic.md) | 底層命名：基礎設施層（L9）vs. 原子操作層 | Accepted | L8/L9 |
| [ADR-0002](ADR-0002-wbs-as-resource-model.md) | WBS 以 Resource 模型建模（3-table）| Accepted | L3/L4/L6 |
| [ADR-0003](ADR-0003-feed-projection-event-pipeline-only.md) | feed_projection 只能由事件管線寫入 | Accepted | L5/L7/L8 |
| [ADR-0004](ADR-0004-skill-mint-log-immutability-xp-saga.md) | skill_mint_log 不可變 + XP 結算 Saga | Accepted | L6/L7/L8 |
| [ADR-0005](ADR-0005-workspace-github-repository-model.md) | Workspace = GitHub Repository 模型 + activeContext | Accepted | L1/L2/L5 |
