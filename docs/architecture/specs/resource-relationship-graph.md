# L7 資源關聯圖 — Resource Relationship Graph

> **層級定位**：本文件定義 resource_items 之間的三類關聯拓撲：Parent-Child 樹、任務依賴圖（DAG）、以及技能圖（技能需求 + XP 等級）。
> 來源：[L3 Use Case R25](../use-cases/use-case-diagram-resource.md)、[L4 SR01–SR20](../use-cases/use-case-diagram-sub-resource.md)、[L5 SB14 DFS Guard](../use-cases/use-case-diagram-sub-behavior.md)、[L6 Domain Model](../models/domain-model.md)

---

## 三類關聯的儲存策略

| 關聯類型 | 儲存位置 | relation_type 值 | 特性 |
|---------|---------|----------------|-----|
| Parent-Child 樹 | `resource_items.parent_id` | — | 性能查詢；self-reference FK |
| 任務依賴 DAG | `resource_relations` | `depends_on` | 有向；必須無環（DFS 守衛） |
| 技能需求連結 | `resource_relations` | `requires_skill` | 有向；由 TaskItem 指向 Skill |
| Feed 投影連結 | `resource_relations` | `feed_source` | 有向；由 FeedProjection 指向 Post |

---

## 一、Parent-Child 樹（WBS Tree）

```mermaid
graph TD
    E["epic (sub_type=epic)"]
    F1["feature A (sub_type=feature)"]
    F2["feature B (sub_type=feature)"]
    S1["story 1 (sub_type=story)"]
    S2["story 2 (sub_type=story)"]
    T1["task 1 (sub_type=task)"]
    T2["task 2 (sub_type=task)"]
    ST1["subtask 1 (sub_type=subtask)"]
    ST2["subtask 2 (sub_type=subtask)"]

    E --> F1
    E --> F2
    F1 --> S1
    F1 --> S2
    S1 --> T1
    S2 --> T2
    T1 --> ST1
    T1 --> ST2

    style E fill:#e8f4f8,stroke:#4a90d9
    style F1 fill:#e8f4f8,stroke:#4a90d9
    style F2 fill:#e8f4f8,stroke:#4a90d9
    style S1 fill:#fef9e7,stroke:#f39c12
    style S2 fill:#fef9e7,stroke:#f39c12
    style T1 fill:#eafaf1,stroke:#27ae60
    style T2 fill:#eafaf1,stroke:#27ae60
    style ST1 fill:#fdedec,stroke:#e74c3c
    style ST2 fill:#fdedec,stroke:#e74c3c
```

### 樹不變式

1. **無向環**：parent_id 路徑最長 5 層（epic → feature → story/task → subtask），應用層強制層級順序。
2. **同 workspace 隔離**：parent_id 所指向的資源必須與子資源擁有相同的 `workspace_id`。
3. **刪除策略**：
   - `subtask`：parent DELETE 時 cascade。
   - `epic / feature / story / task`：有子項目時 forbidden（必須先移除所有子孫節點）。
4. **根節點**：`parent_id IS NULL AND sub_type = 'epic'` 為工作區頂層節點。

---

## 二、任務依賴 DAG（Dependency Graph）

```mermaid
graph LR
    A["task A (done)"]
    B["task B (ready)"]
    C["task C (draft)"]
    D["task D (blocked)"]
    E["task E (draft)"]

    A -->|depends_on| B
    A -->|depends_on| C
    B -->|depends_on| D
    C -->|depends_on| D
    D -->|depends_on| E

    style A fill:#eafaf1,stroke:#27ae60
    style B fill:#eafaf1,stroke:#27ae60
    style C fill:#fff3cd,stroke:#ffc107
    style D fill:#f8d7da,stroke:#dc3545
    style E fill:#e8f4f8,stroke:#4a90d9
```

### DAG 不變式と DFS 守衛（SB14）

```
AddDependencyCommand(from: TaskA, to: TaskB)
  │
  ├── DFSCycleGuard 啟動
  │   └── 從 TaskB 出發做深度優先搜索
  │       → 若可抵達 TaskA，則判定形成環
  │
  ├── [有環] → 發出 CyclicDependencyDetected { cyclePath: [B, ..., A] }
  │             Command 失敗（HTTP 422）
  │
  └── [無環] → 寫入 resource_relations { from_id: A, to_id: B, relation_type: 'depends_on' }
               發出 DependencyAdded
```

**Gantt 閘控規則（R28）**：
- 任務若有未完成的依賴（`depends_on` 且依賴目標狀態非 `done`），則 Gantt view 應標記為 blocked。
- 應用層禁止在 Gantt 中拖動進入 `draft` 狀態的 blocked 任務。

---

## 三、技能圖（Skill Graph）

### A. 技能需求連結（TaskItem → Skill）

```mermaid
graph LR
    T1["task_item (feature)"]
    T2["task_item (task)"]
    S1["skill: TypeScript (level 3+)"]
    S2["skill: System Design (level 4+)"]
    S3["skill: Code Review (level 2+)"]

    T1 -->|requires_skill lv3| S1
    T1 -->|requires_skill lv4| S2
    T2 -->|requires_skill lv2| S3
    T2 -->|requires_skill lv3| S1

    style T1 fill:#e8f4f8,stroke:#4a90d9
    style T2 fill:#eafaf1,stroke:#27ae60
    style S1 fill:#fef9e7,stroke:#f39c12
    style S2 fill:#fef9e7,stroke:#f39c12
    style S3 fill:#fef9e7,stroke:#f39c12
```

### B. UserSkill XP 積累圖

```mermaid
graph TD
    U["user_skill (userId + skillId)"]
    ML1["skill_mint_log #1 (settled, xp=30)"]
    ML2["skill_mint_log #2 (settled, xp=25)"]
    ML3["skill_mint_log #3 (under_validation)"]

    U -->|xp_total 累加| ML1
    U -->|xp_total 累加| ML2
    U -.->|pending| ML3

    XP["xp_total = 55 → level 1 (Journeyman)"]
    U --> XP

    style U fill:#fef9e7,stroke:#f39c12
    style ML1 fill:#eafaf1,stroke:#27ae60
    style ML2 fill:#eafaf1,stroke:#27ae60
    style ML3 fill:#fff3cd,stroke:#ffc107
    style XP fill:#e8f4f8,stroke:#4a90d9
```

### C. 技能門檻驗證流程（ThresholdGuard SB35）

```mermaid
flowchart LR
    CMD["CreateAssignmentCommand"]
    CHECK{"skill_threshold\n設定是否存在？"}
    FETCH["取得 assignee\n的 user_skill\n(xp_total, current_level)"]
    COMPARE{"current_level\n>= required_level?"}
    PASS["繼續建立 assignment_record"]
    FAIL["發出 ThresholdNotMet\nCommand 失敗"]

    CMD --> CHECK
    CHECK -->|"否（無門檻）"| PASS
    CHECK -->|"是"| FETCH
    FETCH --> COMPARE
    COMPARE -->|"是"| PASS
    COMPARE -->|"否"| FAIL
```

---

## XP 等級對照表（Level Table — 系統常數）

| Level | 名稱 | xp_total 下界 | xp_total 上界 | 說明 |
|-------|------|--------------|--------------|-----|
| 1 | Apprentice（學徒） | 0 | 74 | 入門級 |
| 2 | Journeyman（熟練） | 75 | 149 | 可接受基礎指派 |
| 3 | Expert（專家） | 150 | 224 | 可主導子任務 |
| 4 | Artisan（大師） | 225 | 299 | 可主導 Story 層級 |
| 5 | Grandmaster（宗師） | 300 | 374 | 可主導 Feature 層級 |
| 6 | Legendary（傳奇） | 375 | 449 | 可主導 Epic 層級 |
| 7 | Titan（泰坦） | 450 | 524 | 技能最高境界 |

> **Edge Case**：`xp_total >= 525` 時 `current_level` 保持 7（Titan），`xp_total` 繼續累積（為未來等級擴展保留空間）。

---

## 四、資源全域關聯圖（簡化版）

```mermaid
graph LR
    ORG["org"]
    WS["workspace"]
    MEMBER["membership"]
    TASK["task_item (WBS)"]
    POST["post"]
    MEDIA["post_media"]
    FEED["feed_projection (read model)"]
    SCHED["schedule_item"]
    ASSIGN["assignment_record"]
    AVAIL["availability_slot"]
    SKILL["skill (dict)"]
    USKILL["user_skill"]
    MINT["skill_mint_log"]
    REQ["task_skill_requirement"]

    ORG -->|has many| WS
    ORG -->|has many| MEMBER
    ORG -->|has skill dict| SKILL
    ORG -->|has many| AVAIL
    WS -->|has many| TASK
    WS -->|has many| POST
    WS -->|has many| SCHED
    POST -->|has many| MEDIA
    POST -.->|event pipeline→| FEED
    TASK -->|has many| REQ
    REQ -->|requires| SKILL
    SCHED -->|has many| ASSIGN
    ASSIGN -->|checks| AVAIL
    ASSIGN -->|checks| REQ
    SKILL -->|tracks| USKILL
    USKILL -->|has immutable log| MINT
    MINT -->|source task| TASK

    style FEED fill:#fff3cd,stroke:#ffc107
    style MINT fill:#f8d7da,stroke:#dc3545
```
