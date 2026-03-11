# [索引 ID: @VS6-Match] VS6 Scheduling - Resource Match

## Scope

由 `workforce-scheduling-saga` 協調排班資格檢查與補償流程。

## Rules

- MUST: 只讀 `ORG_ELIGIBLE_MEMBER_VIEW` 做資格判斷 (`#14`, `#15`)。
- MUST: 能力需求以 `SK_SKILL_REQ` + `tag-snapshot` 對齊。
- MUST: 失敗情境產生 compensating events (`#A5`)。

## Forbidden

- 直讀其他 slice 私有模型做資格判定。
- 繞過 saga 直接寫 OrganizationSchedule。

## AI 匹配工具銜接（Tool-M / Tool-V Integration）

VS6 排班資源匹配依賴 VS8 Phase 2 智慧匹配流程中的 Tool-M 和 Tool-V：

| 工具 | 名稱 | VS6 使用場景 | 規則 |
|------|------|-------------|------|
| Tool-M | `match_candidates` | 向量近鄰搜尋排班候選人（基於 skillEmbedding 與 requirementsEmbedding 相似度） | E8 fail-closed：metadata 必須帶 tenantId |
| Tool-V | `verify_compliance` | 驗證候選資格：證照有效性、可用時間窗口、組織歸屬 | GT-2 fail-closed：未通過即排除；禁止降級輸出 |

**E8 說明**：排班匹配的向量搜尋必須包含 `metadata.tenantId == request.tenantId` 過濾；未帶 tenantId 的搜尋請求一律 fail-closed（不執行查詢）。

**GT-2 說明**：排班合規驗證（Tool-V）是最終決定候選人是否可被排班的硬過濾器；
即使向量分數高，資格未通過（如證照過期、不在可用時窗）的候選人一律排除。

**BF-1 回饋**：排班確認後（ScheduleConfirmed 事件），VS6 Domain Slice（L3）透過 L4 IER 事件
觸發 VS8 更新 `employees.skillEmbedding` 業務指紋（對齊 SSOT Step 2.14 BF-1）。
