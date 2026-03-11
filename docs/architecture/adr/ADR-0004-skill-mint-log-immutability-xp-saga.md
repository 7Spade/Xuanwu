# ADR-0004：skill_mint_log 不可變性 + XP 結算 Saga 設計

- **Status**: Accepted
- **Date**: 2026-03-12
- **Deciders**: Architecture Team（xuanwu-commander）

---

## Context

技能鑄造結算（Settlement）後，`skill_mint_log` 的可變性設計需要決策：
1. **可修改**：允許管理員事後調整 XP 或手動更正
2. **不可變**：settled 記錄永久鎖定，錯誤只能通過新記錄補正

同時需決定 Settlement 步驟是同步在 Command Handler 內完成，還是非同步 Saga 處理。

---

## Decision

1. `skill_mint_log`（狀態為 `settled`）一旦寫入即**不可修改（immutable）**。
2. XP 一致性修正只能透過 `RecalculateXpCommand`（SB46）以冪等方式重算，不更改已有記錄。
3. Settlement 寫入（SB45）以**事件管線觸發的 Saga** 處理，非同步執行，必須支援冪等重試。

---

## Rationale

**不可變性理由**：
- `skill_mint_log` 是技能資歷的審計記錄（Audit Trail），篡改已驗證的鑄造記錄會破壞信任體系。
- 不可變記錄配合事件溯源（Event Sourcing）使投影可從頭重建，無需快照。
- 若允許修改，任何管理員操作都可能影響用戶 XP，產生安全疑慮（OWASP: Broken Access Control）。

**Saga 理由**：
- Settlement 涉及跨聚合更新：`skill_mint_log`（任務 context）+ `user_skill`（個人 context）。
- 跨聚合不可在同一 Command Handler 中同步完成（違反 L6 聚合根邊界規則：一次 Transaction 只能操作一個聚合根）。
- Saga 提供補償（Compensation）：若 `user_skill` XP 寫入失敗，可標記 `pending_retry`，避免 XP 丟失。

---

## Consequences

**正面影響**：
- 鑄造記錄形成可信任的 Audit Trail。
- Settlement Saga 支援故障恢復（idempotency key + pending_retry 狀態）。
- `RecalculateXp` 指令可安全在生產環境執行一致性修正，無破壞性。

**負面影響**：
- XP 顯示有最終一致性延遲（Saga 非同步處理）；前端需處理「pending」狀態。
- 需要 Dead Letter Queue 監控 Settlement Saga 失敗案例。

---

## Alternatives Considered

| 選項 | 拒絕原因 |
|------|---------|
| skill_mint_log 可修改 | 破壞 Audit Trail 完整性；安全風險 |
| 同步在 ApproveValidation Handler 內完成 Settlement | 跨聚合同步寫入違反 L6 聚合邊界規則 |
| 允許管理員直接調整 user_skill.xp_total | 繞過鑄造流程；無法重建 XP 來源鏈 |

---

## References

- [L4 SR42 Settlement 寫入](../use-cases/use-case-diagram-sub-resource.md)
- [L5 SB40–SB46 鑄造原子行為](../use-cases/use-case-diagram-sub-behavior.md)
- [L8 Saga 設計](../blueprints/application-service-spec.md)
