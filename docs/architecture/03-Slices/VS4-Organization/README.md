# VS4-Organization

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
