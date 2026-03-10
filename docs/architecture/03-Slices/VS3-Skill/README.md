# VS3-Skill

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
