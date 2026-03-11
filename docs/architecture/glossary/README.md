# glossary/ — Architecture Glossary

> **用途**：定義專案中使用的核心術語、領域模型名稱與技術層級對應。確保開發團隊在溝通與命名上具備一致的語言（Ubiquitous Language）。

---

## L1-L9 層級詞彙

| 詞彙 | 定義 | 參考 |
|-----|------|------|
| L1 Platform Boundary | 平台/個人/組織的頂層邊界 | `../use-cases/use-case-diagram-saas-basic.md` |
| L2 Workspace Boundary | 工作區生命週期與 ACL 邊界 | `../use-cases/use-case-diagram-workspace.md` |
| L3 Resource Boundary | 資源型別與操作邊界（R1-R53）| `../use-cases/use-case-diagram-resource.md` |
| L4 Sub-Resource Boundary | 子資源 ownership/scope/parent 規則 | `../use-cases/use-case-diagram-sub-resource.md` |
| L5 Sub-Behavior Boundary | 命令行為、守衛、狀態機與事件 | `../use-cases/use-case-diagram-sub-behavior.md` |
| L6 Domain Model | 聚合根、不變式、跨聚合事件橋 | `../models/domain-model.md` |
| L7 Contract | Command/Event 型別與 payload 契約 | `../specs/contract-spec.md` |
| L8 Application Service | Handler/Saga 編排層 | `../blueprints/application-service-spec.md` |
| L9 Infrastructure | Repository/EventBus/Adapter 實作層 | `../guidelines/infrastructure-spec.md` |

---

## 角色與情境詞彙

| 詞彙 | 定義 |
|-----|------|
| activeContext | 當前使用者活躍情境，至少包含 userId、orgId、workspaceId、role |
| OrgOwner | 組織擁有者，具跨工作區高權限 |
| WSOwner / WSAdmin / WSMember / WSViewer | 工作區四級角色層級 |
| Scope | 資源可見與可操作範圍：workspace / org / personal |

---

## 領域模型詞彙

| 詞彙 | 定義 |
|-----|------|
| Aggregate Root | 聚合根，封裝狀態轉移與不變式的唯一入口 |
| TaskItem Aggregate | WBS 任務聚合（epic/feature/story/task/subtask） |
| Post Aggregate | 貼文聚合，包含 post_media |
| ScheduleItem Aggregate | 排程聚合，包含 assignment_record |
| UserSkill Aggregate | 技能資產聚合，包含 skill_mint_log |
| FeedProjection | Read Model（CQRS），只能由事件管線建立或更新 |

---

## Guard 與一致性詞彙

| 詞彙 | 定義 |
|-----|------|
| ScopeGuard | 驗證 actor 情境與資源 scope 是否一致 |
| IdempotencyGuard | 保證重送同指令不重複執行 |
| OptimisticLockGuard | 以 version 防止併發覆寫 |
| DFSCycleGuard | 驗證任務依賴圖不形成循環 |
| ThresholdGuard | 驗證技能門檻是否達標 |
| AvailabilityConflictGuard | 驗證排程時段是否衝突 |

---

## 事件與流程詞彙

| 詞彙 | 定義 |
|-----|------|
| Domain Event | 聚合狀態改變後發出的不可變事件 |
| Saga | 跨聚合長流程協調者，透過事件驅動，不直接承載領域規則 |
| Read Model | 供查詢最佳化的投影資料模型 |
| DLQ | Dead Letter Queue，事件重試失敗後的隔離佇列 |

---

## 術語治理規則

1. 文件與程式命名優先使用本詞彙表術語。
2. 新增術語時，需補上「定義 + 所屬層級 + 參考文件」。
3. 若術語語義改變，需同步更新對應 ADR 或 specs。
4. Mermaid 圖使用術語前，先確認該術語已在本表定義。

