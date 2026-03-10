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
