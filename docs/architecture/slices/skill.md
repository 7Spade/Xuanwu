# VS3 · Skill（SSOT Aligned）

## 責任

管理技能 XP 與能力等級推導，並以事實事件驅動 VS8 可塑性學習。

## 核心模型

- `account-skill.aggregate`（`tag::skill` = `TE2`）
- `account-skill-xp-ledger`（XP 異動必寫 [#13]）
- `getTier(xp)`（`TE3 tag::skill-tier`，純函式，不落庫 [#12]）

## 事件

- `SkillXpAdded | SkillXpDeducted`
- 事件需帶 `tagSlug` 與 `aggregateVersion`

## Mandatory Rules

- `#12`：tier 永遠推導值
- `#13`：XP 異動必寫 ledger
- `D24`：不直連 Firebase
- `D21-G`：VS8 learning 只接收真實事實事件
