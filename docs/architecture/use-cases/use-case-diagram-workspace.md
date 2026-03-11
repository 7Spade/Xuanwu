# Xuanwu 工作區層級 Use Case Diagram

> **層級定位**：本文件為平台 Use Case 的下一層，描述單一「工作區」內的行為邊界。
> 上層對應：[use-case-diagram-saas-basic.md](./use-case-diagram-saas-basic.md) 中的 `UC19 在組織內建立工作區` 與 `UC7 查看個人工作區`。

## 工作區在架構中的位置

```
Platform SaaS 邊界
└── Personal Account / Organization   ← 上層圖（use-case-diagram-saas-basic.md）
    └── Workspace（本圖）             ← 當前層
        └── Resource / Item           ← 下一層（已建：use-case-diagram-resource.md）
```

工作區（Workspace）等同於 GitHub 中的 **Repository**：
- 可屬於個人帳號（personal workspace）或組織（org workspace）
- 有自己的成員清單（可以是 Org成員的子集，或個人邀請的外部協作者）
- 有自己的四級角色體系
- 所有操作都在 `activeContext` scope 內執行，嚴格與其他工作區隔離

細部資源欄位請參考：`docs/architecture/specs/resource-attribute-matrix.md`（中英對照）。

---

## Actor 說明

| Actor | 類型 | 說明 |
|-------|------|------|
| **用戶** (User) | 根 Actor | 未加入任何工作區時的狀態；可建立新工作區 |
| **工作區擁有者** (WSOwner) | 情境角色 | User 建立工作區後自動升格；全權限 |
| **工作區管理員** (WSAdmin) | 情境角色 | WSOwner 授權；可管理成員與內容，但無法刪除工作區或移轉擁有權 |
| **工作區成員** (WSMember) | 情境角色 | 被邀請後加入；可讀寫內容 |
| **工作區訪客** (WSViewer) | 情境角色 | 唯讀權限；可查看但不可修改任何資源 |
| **AI 系統** (AI System) | 系統 Actor | 在工作區情境下提供 AI 輔助，虛線表示系統觸發 |

> **角色繼承關係（向下包含）**：
> `WSOwner` ⊇ `WSAdmin` ⊇ `WSMember` ⊇ `WSViewer`
>
> **夥伴放位**：外部夥伴（Partner）不另立新 Actor，透過邀請後套用 `WSMember` 或 `WSViewer` 權限模板；其可見與可操作邊界由 workspace ACL 決定。

---

## Use Case 邊界（WS1–WS30）

| 邊界 | 涵蓋 UC |
|------|---------|
| 🔧 工作區生命週期 | 建立、切換、歸檔、刪除、從範本建立、複製 |
| ⚙️ 工作區設定 | 名稱描述、可見性、移轉擁有權、整合 Webhook |
| 👥 成員管理 | 邀請、設定角色、移除、查看清單 |
| 📦 工作區內容操作 | 儀表板、CRUD 資源項目、搜尋、匯出、活動記錄 |
| 🖼️ 工作區交流 | 建立貼文、設定貼文可見性 |
| 🗓️ 排程與指派 | 建立任務排程、提交指派需求 |
| 🧩 任務資格 | 設定任務技能門檻、查看候選資格匹配 |
| 🤖 AI 輔助 | 摘要工作區活動、建議下一步、語意搜尋 |

---

## 權限矩陣

| Use Case | WSOwner | WSAdmin | WSMember | WSViewer |
|----------|:-------:|:-------:|:--------:|:--------:|
| WS2 切換工作區 | ✓ | ✓ | ✓ | ✓ |
| WS3 歸檔工作區 | ✓ | — | — | — |
| WS4 刪除工作區 | ✓ | — | — | — |
| WS6 複製工作區 | ✓ | — | — | — |
| WS7 設定名稱描述 | ✓ | ✓ | — | — |
| WS8 設定可見性 | ✓ | — | — | — |
| WS9 移轉擁有權 | ✓ | — | — | — |
| WS10 管理整合 Webhook | ✓ | ✓ | — | — |
| WS11 邀請成員 | ✓ | ✓ | — | — |
| WS12 設定成員角色 | ✓ | ✓ | — | — |
| WS13 移除成員 | ✓ | ✓ | — | — |
| WS14 查看成員清單 | ✓ | ✓ | ✓ | ✓ |
| WS15 查看儀表板 | ✓ | ✓ | ✓ | ✓ |
| WS16 建立資源項目 | ✓ | ✓ | ✓ | — |
| WS17 編輯資源項目 | ✓ | ✓ | ✓ | — |
| WS18 刪除資源項目 | ✓ | — | — | — |
| WS19 搜尋工作區內容 | ✓ | ✓ | ✓ | ✓ |
| WS20 匯出工作區資料 | ✓ | ✓ | — | — |
| WS21 查看活動記錄 | ✓ | ✓ | ✓ | ✓ |
| WS25 建立貼文（文字+圖片） | ✓ | ✓ | ✓ | — |
| WS26 設定貼文可見性 | ✓ | ✓ | ✓（自己建立的） | — |
| WS27 建立任務排程 | ✓ | ✓ | ✓ | — |
| WS28 提交指派需求 | ✓ | ✓ | ✓ | — |
| WS29 設定任務技能門檻 | ✓ | ✓ | — | — |
| WS30 查看候選資格匹配 | ✓ | ✓ | ✓ | ✓ |

---

## Diagram

```mermaid
graph LR
    classDef actor fill:#dbeafe,stroke:#3b82f6,color:#1e40af,font-weight:bold
    classDef roleActor fill:#dcfce7,stroke:#16a34a,color:#14532d,font-weight:bold
    classDef roleActorLite fill:#fef9c3,stroke:#ca8a04,color:#713f12,font-weight:bold
    classDef systemActor fill:#f3e8ff,stroke:#a855f7,color:#6b21a8,font-weight:bold
    classDef usecase fill:#f0fdf4,stroke:#22c55e,color:#166534
    classDef refUC fill:#f1f5f9,stroke:#94a3b8,color:#475569,stroke-dasharray:4 2

    User((用戶)):::actor
    WSOwner((工作區擁有者)):::roleActor
    WSAdmin((工作區管理員)):::roleActor
    WSMember((工作區成員)):::roleActorLite
    WSViewer((工作區訪客)):::roleActorLite
    AI((AI 系統)):::systemActor

    User -. 建立工作區後升格 .-> WSOwner
    User -. 被邀請進入 .-> WSMember
    WSOwner -. 可授權為 .-> WSAdmin
    WSAdmin -. 可降級為 .-> WSMember
    WSMember -. 可設為 .-> WSViewer

    subgraph workspace["📁 工作區層級 Use Case（依 activeContext scope 執行）"]
        subgraph wsLifecycle["🔧 工作區生命週期"]
            WS1([建立工作區]):::usecase
            WS2([切換工作區]):::usecase
            WS3([歸檔工作區]):::usecase
            WS4([刪除工作區]):::usecase
            WS5([從範本建立工作區]):::usecase
            WS6([複製工作區]):::usecase
        end
        subgraph wsSettings["⚙️ 工作區設定"]
            WS7([設定工作區名稱與描述]):::usecase
            WS8([設定可見性 Private ↔ Org]):::usecase
            WS9([移轉工作區擁有權]):::usecase
            WS10([管理工作區整合 Webhook]):::usecase
        end
        subgraph wsMembers["👥 成員管理"]
            WS11([邀請成員加入工作區]):::usecase
            WS12([設定成員角色]):::usecase
            WS13([移除成員]):::usecase
            WS14([查看成員清單]):::usecase
        end
        subgraph wsContent["📦 工作區內容操作"]
            WS15([查看工作區儀表板]):::usecase
            WS16([建立資源項目]):::usecase
            WS17([編輯資源項目]):::usecase
            WS18([刪除資源項目]):::usecase
            WS19([搜尋工作區內容]):::usecase
            WS20([匯出工作區資料]):::usecase
            WS21([查看活動記錄]):::usecase
        end
        subgraph wsSocial["🖼️ 工作區交流"]
            WS25([建立貼文（文字+圖片）]):::usecase
            WS26([設定貼文可見性]):::usecase
        end
        subgraph wsPlanning["🗓️ 排程與指派"]
            WS27([建立任務排程]):::usecase
            WS28([提交指派需求]):::usecase
        end
        subgraph wsQualification["🧩 任務資格"]
            WS29([設定任務技能門檻]):::usecase
            WS30([查看候選資格匹配]):::usecase
        end
        subgraph wsAI["🤖 AI 輔助（工作區情境）"]
            WS22([AI 摘要工作區活動]):::usecase
            WS23([AI 建議下一步行動]):::usecase
            WS24([智慧搜尋語意比對]):::usecase
        end
        subgraph wsContext["🔗 上層參考（來自平台層）"]
            REF1([UC9 切換情境 Personal ↔ 組織]):::refUC
            REF2([UC18 存取組織共用資源]):::refUC
        end
    end

    %% User 基本操作
    User --> WS1
    User --> WS2
    User --> WS5
    User --> WS15
    User --> WS19
    User --> WS21

    %% WSOwner 全權限
    WSOwner --> WS2
    WSOwner --> WS3
    WSOwner --> WS4
    WSOwner --> WS6
    WSOwner --> WS7
    WSOwner --> WS8
    WSOwner --> WS9
    WSOwner --> WS10
    WSOwner --> WS11
    WSOwner --> WS12
    WSOwner --> WS13
    WSOwner --> WS14
    WSOwner --> WS15
    WSOwner --> WS16
    WSOwner --> WS17
    WSOwner --> WS18
    WSOwner --> WS20
    WSOwner --> WS21
    WSOwner --> WS25
    WSOwner --> WS26
    WSOwner --> WS27
    WSOwner --> WS28
    WSOwner --> WS29
    WSOwner --> WS30

    %% WSAdmin 管理但無法刪除/移轉
    WSAdmin --> WS2
    WSAdmin --> WS7
    WSAdmin --> WS10
    WSAdmin --> WS11
    WSAdmin --> WS12
    WSAdmin --> WS13
    WSAdmin --> WS14
    WSAdmin --> WS15
    WSAdmin --> WS16
    WSAdmin --> WS17
    WSAdmin --> WS20
    WSAdmin --> WS21
    WSAdmin --> WS25
    WSAdmin --> WS26
    WSAdmin --> WS27
    WSAdmin --> WS28
    WSAdmin --> WS29
    WSAdmin --> WS30

    %% WSMember 協作
    WSMember --> WS2
    WSMember --> WS14
    WSMember --> WS15
    WSMember --> WS16
    WSMember --> WS17
    WSMember --> WS19
    WSMember --> WS21
    WSMember --> WS25
    WSMember --> WS26
    WSMember --> WS27
    WSMember --> WS28
    WSMember --> WS30

    %% WSViewer 唯讀
    WSViewer --> WS2
    WSViewer --> WS14
    WSViewer --> WS15
    WSViewer --> WS19
    WSViewer --> WS21
    WSViewer --> WS30

    %% AI 系統觸發
    AI -.-> WS22
    AI -.-> WS23
    AI -.-> WS24

    %% 與上層的關係
    WS1 -.->|需先完成| REF1
    WS16 -.->|可引用| REF2
```

---

## 設計備註

- **WS2 切換工作區** 與上層的 UC9 切換情境不同：UC9 是 Personal ↔ Org 的大情境切換，WS2 是同一情境下多個工作區之間的切換。
- **可見性（WS8）**：`Private` = 僅工作區成員可見；`Org-visible` = 同組織所有成員可瀏覽但不可編輯。
- **WSAdmin 限制**：無法執行 WS3（歸檔）、WS4（刪除）、WS6（複製）、WS8（改可見性）、WS9（移轉擁有權）、WS18（刪除資源項目），避免過度授權。
- **WS18 刪除策略**：刪除僅限 WSOwner；WSAdmin/WSMember 不提供直接刪除，改採資源層歸檔（R11）與流程審核替代。
- **Team/Partner 放位**：`Team` 留在 L1 組織治理語意；`Partner` 在 L2 以邀請後 ACL 映射為 `WSMember/WSViewer`。
- **WS5 從範本建立** 依訂閱方案 gating，部分範本為 Pro/Enterprise 限定。
- **資料隔離**：工作區內所有查詢必須攜帶 `workspaceId` scope，`orgId`/`personalId` 由上層 `activeContext` 帶入，不重複傳遞。
- **下一層**：工作區內的 `Resource / Item` 層級（單一資源的 CRUD 詳細流程）見 `use-case-diagram-resource.md`。
- **技能門檻先於指派**：`WS29 設定任務技能門檻` 是 `WS28 提交指派需求` 的前置條件，若任務未定義門檻則只能做人工指派，不能做資格匹配推薦。

### WS29 門檻對照（`required_level` -> XP）

| `required_level` | 門檻名稱 | 通過門檻所需 `user_skill.xp_total` |
|---|---|---|
| `1` | Apprentice（學徒） | `>= 0` |
| `2` | Journeyman（熟練） | `>= 75` |
| `3` | Expert（專家） | `>= 150` |
| `4` | Artisan（大師） | `>= 225` |
| `5` | Grandmaster（宗師） | `>= 300` |
| `6` | Legendary（傳奇） | `>= 375` |
| `7` | Titan（泰坦） | `>= 450` |

> 判定規則：`matching_result.threshold_passed = (user_skill.current_level >= task_skill_requirement.required_level)`，等級由 `xp_total` 依上表推導。

## 增量設計（功能 1 / 2）

| 功能 | L2 放位（工作區層） | 對應文件 |
|---|---|---|
| 1. 組織<->工作區照片牆 | `F1-L2-1 建立貼文（文字+圖片）`、`F1-L2-2 貼文可見性設定` | `docs/architecture/specs/org-workspace-feed-architecture.md` |
| 2. 工作區排程 + 組織指派 | `F2-L2-1 建立任務排程`、`F2-L2-2 提交指派需求` | `docs/architecture/specs/scheduling-assignment-architecture.md` |
