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
