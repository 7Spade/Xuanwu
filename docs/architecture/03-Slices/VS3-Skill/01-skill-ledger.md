# [索引 ID: @VS3-SKILL] VS3 Skill - XP Ledger

## Scope

VS3 是 XP 寫入唯一權威，維護技能成長與可追溯帳本。

## Contract (`A17`)

- MUST: XP 來源必須是 VS5 的 `TaskCompleted` 與 `QualityAssessed` 事實事件。
- MUST: `awardedXp = baseXp * qualityMultiplier * policyMultiplier`，並做 clamp。
- MUST: 每次異動寫入 append-only ledger (`#13`)。

## Semantic Boundary

- VS8 只提供 `semanticTagSlug` 與 policy lookup。
- FORBIDDEN: VS8 直接寫 VS3 ledger。
- MUST: skill/tier 標籤引用 TE contracts，避免裸字串 (`D22`)。

## Read/Write Notes

- Tier 必須由 `getTier(xp)` 推導 (`#12`)。
- projection 更新需經 S2 version guard。

## Phase 對齊規則（SSOT Alignment）

| 規則 | 類型 | 說明 |
|------|------|------|
| `FI-002` | MUST | XP Ledger append 操作必須使用 Firestore 單一事務；禁止 multi-step 非原子寫入 |
| `D29` | MUST | 所有 XP 命令（AddXP/AdjustXP）必須攜帶 TransactionalCommand 標記 |
| `LANE-S` | MUST | XPAdded 事件走 STANDARD_LANE |
| `LANE-C` | MUST | SkillTierChanged 事件走 CRITICAL_LANE（影響 Phase 2 匹配資格） |
| `BF-1` | MUST | 任務結果確認後，XP 變化事件透過 L4 IER 觸發 VS8 更新 `employees.skillEmbedding`（業務指紋回饋） |
| `E8-VS3` | MUST | XP 查詢必須帶 tenantId；跨租戶查詢一律 fail-closed |
