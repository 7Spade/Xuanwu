# VS3-Skill

## 一眼摘要

- 用途：作為技能成長與 XP 帳本的權威切片，定義技能等級、累積與扣減的可審計規則。
- 核心功能：XP ledger ownership（`A17`）、tier derivation（`#12`）、與 VS8 的 semantic tag lookup 邊界。
- 解決痛點：
	1. 技能成長缺乏可追溯記帳，難以說明等級變化的依據。
	2. 不同場景各自計算 tier，造成同一使用者出現多種技能等級結果。
	3. 技能標籤語義責任不清，導致 VS3 與 VS8 職責交疊。

- XP ledger ownership (`A17`)
- Tier derivation (`#12`)
- Semantic tag lookup boundary with VS8

## Implemented Capabilities (from code)

- XP aggregate actions: `addSkillXp` / `deductSkillXp`（server action 入口）。
- Domain operations: `addXp` / `deductXp` / `getSkillXp`，含 XP 邊界常數。
- Ledger model: `XpLedgerEntry`（每次 XP 變更需記帳）。
- Projection handlers: `applySkillXpAdded` / `applySkillXpDeducted`。
- Tag pool: add/remove/ref-count，並支援 TagLifecycle 被動同步。
- Org skill recognition: grant/revoke recognition。
- Read queries: account skill view、org skill tags、member recognitions。
- UI: `PersonalSkillPanel`。

## SSOT Phase 對齊（Phase Alignment）

| Phase | 步驟 | VS3 Skill 角色 |
|-------|------|--------------|
| Phase 0 (0.2) | 建立標籤本體論 (D3→L8) | VS3 的 XP 等級標籤（Skill Tier slugs）屬於 VS8 tag ontology 的一部分；初始化時由 VS8 Admin 定義（Step 0.1/0.2） |
| Phase 1 (1.3-1.4) | D29 TransactionalCommand + FI-002 | XP Ledger append 操作必須攜帶 TransactionalCommand 標記並使用 Firestore 單一事務 |
| Phase 1 (1.7-1.8) | LANE 分流 | SkillTierChanged → CRITICAL_LANE；XPAdded → STANDARD_LANE |
| Phase 2 (2.14) | BF-1 業務指紋回饋 | 任務結果確認後（AcceptanceConfirmed），XP 變化觸發 VS8 更新 `employees.skillEmbedding` |

**E8 邊界**：VS3 的 XP 查詢必須帶 tenantId；跨租戶 XP 讀取一律拒絕。
