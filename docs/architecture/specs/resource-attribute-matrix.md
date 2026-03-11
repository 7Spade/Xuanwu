# L7 資源屬性矩陣 — Resource Attribute Matrix

> **層級定位**：本文件定義系統所有 20 個 resource_type 的欄位規格、scope 語義، dual-ownership 規則與儲存策略。
> 來源：[L3 Use Case Diagram Resource](../use-cases/use-case-diagram-resource.md)、[L6 Domain Model](../models/domain-model.md)

---

## 三表基礎模型

```sql
-- 型別定義表（系統常數，CDN 配置層管理）
resource_types (
  code              VARCHAR(50) PRIMARY KEY,    -- 'task_item', 'post', ...
  name              VARCHAR(100) NOT NULL,
  required_fields   JSONB NOT NULL DEFAULT '[]',
  validation_rules  JSONB NOT NULL DEFAULT '{}',
  state_machine_id  VARCHAR(50),               -- 對應 L6 state machine 定義
  default_scope     VARCHAR(20) NOT NULL        -- 'workspace' | 'org' | 'personal'
);

-- 資源實例表（所有資源的統一儲存）
resource_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type              VARCHAR(50) NOT NULL REFERENCES resource_types(code),
  sub_type          VARCHAR(50),               -- WBS level discriminator
  workspace_id      UUID,                      -- nullable（org/personal scope 資源）
  org_id            UUID,                      -- nullable（workspace/personal scope 資源）
  personal_id       UUID,                      -- nullable（workspace/org scope 資源）
  parent_id         UUID REFERENCES resource_items(id),
  assignee_id       UUID,                      -- 業務 owner（接受者）
  business_owner_id UUID NOT NULL,             -- 業務 owner（建立者或提名人）
  status            VARCHAR(30) NOT NULL DEFAULT 'draft',
  version           INTEGER NOT NULL DEFAULT 0,
  extension_fields  JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 資源關聯表（依賴、技能需求、feed 投影連結等）
resource_relations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id       UUID NOT NULL REFERENCES resource_items(id),
  to_id         UUID NOT NULL REFERENCES resource_items(id),
  relation_type VARCHAR(50) NOT NULL,          -- 'depends_on' | 'skill_requires' | ...
  workspace_id  UUID,
  created_by    UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 20 個 Resource Type 屬性矩陣

| # | code | 中文名稱 | scope | parent_id 指向 | sub_type 用途 | status 狀態機 | 刪除策略 |
|---|------|---------|-------|--------------|----------------|-------------|---------|
| 1 | `task_item` | 工作項目（WBS 節點） | workspace | task_item（自引用）| epic \| feature \| story \| task \| subtask | 7-state（draft→archived）| forbidden（有子項）/ cascade（subtask）|
| 2 | `post` | 工作區貼文 | workspace | — | — | 3-state（draft→archived）| soft-delete |
| 3 | `post_media` | 貼文媒體附件 | workspace | post | image \| video \| file | — | cascade（隨 post）|
| 4 | `schedule_item` | 排程事項 | workspace | — | — | 5-state（pending→cancelled）| soft-delete |
| 5 | `assignment_record` | 指派記錄 | workspace | schedule_item | — | 5-state（pending→cancelled）| cascade（隨 schedule_item）|
| 6 | `availability_slot` | 時段可用性 | **org** | — | — | — | soft-delete（is_deleted） |
| 7 | `user_skill` | 用戶技能資產 | **personal** | — | — | — | forbidden |
| 8 | `skill_mint_log` | 技能鑄造紀錄 | personal | user_skill | — | 4-stage（declared→settled）| **immutable**（禁止刪除）|
| 9 | `skill` | 技能字典條目 | **org** | — | — | active \| deprecated | soft-delete |
| 10 | `task_skill_requirement` | 工作技能需求 | workspace | task_item | — | — | cascade（隨 task_item）|
| 11 | `matching_result` | 技能門檻匹配結果 | workspace | task_item | — | — | cascade（隨 task_item）|
| 12 | `feed_projection` | 動態消息投影（read model）| **org** | — | — | — | 不可由 Command 操作（ADR-0003）|
| 13 | `workspace` | 工作區 | org | — | — | active \| archived \| deleted | soft-delete |
| 14 | `org` | 組織 | — | — | — | active \| suspended \| deleted | soft-delete |
| 15 | `membership` | 成員關係 | workspace / org | — | workspace_member \| org_member | active \| suspended \| removed | soft-delete |
| 16 | `role_assignment` | 角色授權 | workspace | membership | — | — | cascade（隨 membership）|
| 17 | `skill_threshold` | 技能門檻設定 | workspace | task_item \| schedule_item | — | — | cascade |
| 18 | `comment` | 評論 | workspace | task_item \| post | — | 2-state（active \| deleted）| soft-delete |
| 19 | `notification` | 系統通知 | personal | — | — | unread \| read \| archived | soft-delete |
| 20 | `audit_log` | 稽核日誌 | org | — | — | — | **immutable**（禁止刪除）|

---

## Dual-Ownership 欄位語義

```
business_owner_id  → 資源的業務負責人（可被轉讓）
                     通常為建立者，可由 WSAdmin/WSOwner 指派給他人
assignee_id        → 資源的執行執行人（接受者）
                     task_item 的執行者；assignment_record 的受指派人
```

### Dual-Ownership 規則矩陣

| resource type | business_owner_id 語義 | assignee_id 語義 | 可轉讓？ |
|--------------|----------------------|-----------------|---------|
| `task_item` | 工作業主（負責完成）| 執行人（可不同於業主）| 雙欄均可轉讓 |
| `post` | 發文者（業主）| — | business_owner 可轉讓 |
| `schedule_item` | 排程建立者 | 指派目標人 | 雙欄均可轉讓 |
| `assignment_record` | 繼承自 schedule_item | 接受者（確認制）| 不可在已 confirmed 後轉讓 |
| `skill_mint_log` | 技能擁有者（user_id）| — | 不可轉讓（immutable）|
| `audit_log` | 系統（system-generated）| — | 不可轉讓 |

---

## Scope 隔離規則

```
workspace scope   → workspace_id NOT NULL, org_id 可填（用於 Feed/Skill 跨組織查詢），personal_id NULL
org scope         → org_id NOT NULL, workspace_id NULL, personal_id NULL
personal scope    → personal_id（= user_id）NOT NULL, workspace_id NULL, org_id NULL
```

### Scope Guard 驗證規則（SB51）

每個 Command 在入口必須確認 actor 的活躍情境（`activeContext`）中的 `workspaceId`、`orgId` 與資源的 scope 欄位一致：

| 資源 scope | 驗證邏輯 |
|-----------|---------|
| workspace | `actor.workspaceId == resource.workspace_id` AND `actor.orgId == resource.org_id` |
| org | `actor.orgId == resource.org_id` |
| personal | `actor.userId == resource.personal_id` |

---

## extension_fields JSONB Schema 範例

### task_item
```json
{
  "description": "string",
  "due_date": "ISO8601",
  "priority": "low|medium|high|critical",
  "gantt_start": "ISO8601",
  "gantt_end": "ISO8601",
  "story_points": "integer"
}
```

### post
```json
{
  "content": "string (markdown)",
  "tags": ["string"],
  "mentions": ["user_id"]
}
```

### skill_mint_log
```json
{
  "evidence_url": "string (L9 Storage URL)",
  "validator_comment": "string",
  "xp_proposal": "integer",
  "settled_at": "ISO8601"
}
```

### availability_slot
```json
{
  "recurrence_rule": "RRULE string (optional)",
  "timezone": "TZ identifier"
}
```
