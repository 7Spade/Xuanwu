# VS4-Organization

## 一眼摘要

- 用途：管理組織拓樸、成員與政策邊界，定義組織層級的人才與技能治理視圖。
- 核心功能：org topology and policy、talent repository、eligibility view contracts（`#14` `#15` `#16`）、skill matrix thresholds（XP 寫入維持在 VS3）。
- 解決痛點：
	1. 組織結構與權責散落，造成 team/member/partner 管理流程不一致。
	2. 人才資格判斷來源分裂，排班與任務分派時缺少一致的 eligibility 依據。
	3. 技能門檻與 XP 記帳責任混淆，導致跨切片邏輯耦合。

- Org topology and policy
- Talent repository and eligibility view contracts (`#14` `#15` `#16`)
- Skill matrix thresholds (XP writes stay in VS3)

## Implemented Capabilities (from code)

- Core org lifecycle: create/update/delete org，與 setupOrganizationWithTeam。
- Core event bus: org event publish/subscribe（排班/政策/成員/技能事件）。
- Gov teams: team create、member update、query/subscribe。
- Gov members: recruit/dismiss + members view/query。
- Gov partners: partner group/invite/dismiss + query/subscribe。
- Gov policy: org policy create/update/delete/query。
- Gov semantic: org task-type / skill-type 字典 CRUD、resolver、assistant actions、dictionary panel。

## SSOT Phase 對齊（Phase Alignment）

| Phase | 步驟 | VS4 Organization 角色 |
|-------|------|----------------------|
| Phase 0 (0.3 Note) | 員工畫像（VS2） | VS4 管理組織架構與成員資格；成員資格確認後，VS2 Account/Profile 的 Phase 0.3 初始化才能完整 |
| Phase 1 (1.3-1.8) | 寫入鏈 + 事件 | 組織命令（CreateOrg/AddMember）走 D29 TransactionalCommand + FI-002；PolicyChanged → CRITICAL_LANE |
| Phase 2 (2.6) | Tool-M 候選池 | VS4 的 `ORG_ELIGIBLE_MEMBER_VIEW`（#A16）是 Tool-M（match_candidates）查詢的候選人資料來源之一 |

**E8 邊界**：組織成員查詢必須帶 tenantId；跨租戶組織資料讀寫一律 fail-closed。
