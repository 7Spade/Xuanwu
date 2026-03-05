# VS4 · Organization（SSOT Aligned）

## 責任

管理組織核心、成員/夥伴/團隊治理與組織政策。

## 語義對齊（TE）

- 成員等級：`TE1 tag::user-level`
- 成員角色：`TE5 tag::role`
- 團隊：`TE4 tag::team`
- 夥伴：`TE6 tag::partner`

## 核心模型

- `organization-core.aggregate`
- `org.member` / `org.partner` / `org.team`
- `org.policy`
- `org-skill-recognition.aggregate`

## 事件

- `OrgContextProvisioned`（`E2`）
- `MemberJoined | MemberLeft`
- `SkillRecognitionGranted | SkillRecognitionRevoked`
- `PolicyChanged`

## Mandatory Rules

- `#16`：Talent Repository = member + partner + team
- `D24`：不直連 Firebase
- `D7`：跨切片只走公開 API
- `A9`：高風險授權判斷可回源 aggregate
