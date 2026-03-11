# [索引 ID: @INV-A] Authority Invariants (A / #A)

本檔定義「誰有權做什麼」，任何違反都屬架構違規。

## 1. 邊界與原子性

- `#1` 每個 BC 只能修改自己的 aggregate。
- `#2` 跨 BC 僅可透過 Event / Projection / ACL 溝通。
- `#A8` 1 command -> 1 aggregate，TX Runner 不得同時寫多聚合。
- `#4a/#4b` Domain Event 只能由 aggregate 產生；TX Runner 僅負責 outbox 投遞。

## 2. 權威出口

- `#A12` Search Authority
	- MUST: 所有跨域搜尋必須走 `global-search.slice`。
	- FORBIDDEN: 任何 slice 自建跨域搜尋 API。
- `#A13` Side-effect Authority
	- MUST: 所有通知副作用必須走 `notification-hub.slice`。
	- FORBIDDEN: 業務 slice 直接呼叫 email/push/sms provider。

## 3. 授權與範圍

- `#A9` Scope Guard
	- 快速授權路徑可走 read model。
	- 高風險操作必須回源 aggregate 校驗。
- `#5` Custom Claims 為快照，不是最終授權真相。

## 4. 協作與補償

- `#A5` 排班跨片協作必須以 saga + compensating events 實現。
- MUST: IF compensation 觸發 THEN 必須產生可追蹤事件 (`ScheduleAssignRejected`, `ScheduleProposalCancelled`)。

## 5. 決策權邊界

- `#A14` 成本分類與任務物化決策由 VS8 + VS5 gate 主導。
- `#A15/#A21/#A22` Finance gate、請款生命週期與狀態回饋投影不得被其他 slice 繞過。
- `A17` XP 寫入權限僅在 VS3，VS8 只提供語義與 policy lookup。
- `A18` 組織自訂 task-type / skill-type 語義必須走 VS4 `org-semantic-registry`（`org-task-type-registry` + `org-skill-type-registry`），並以 org namespace 寫入 tag-snapshot。

## Phase 2 AI 決策邊界（AI Decision Authority）

- **L10 Genkit 編排器**：可調用 Tool-S/M/V；不可直接修改 L3 Aggregate 狀態；不可直接寫入 L8（需透過 L3 domain）
- **Tool-S**（search_skills）：僅語義查詢；返回 canonicalSlug；嚴禁寫入任何狀態（B1 Read-only）
- **Tool-M**（match_candidates）：向量查詢；**必須 tenantId 強綁定**（E8 fail-closed）；嚴禁跨租戶查詢
- **Tool-V**（verify_compliance）：資格硬過濾；**未通過即排除**（GT-2 fail-closed）；禁止降級輸出未驗證候選人
- L10 匹配流程 **不可** 繞過 Tool-V 直接輸出候選結果

## 軌跡與稽核邊界（Trace & Audit Authority）

- **L0B**（Server Action 串流橋接）：擁有 AI 推理軌跡串流至 UI 的權限（Step 2.8-2.9）；不可持久化狀態
- **L4**（IER 事件路由器）：擁有決策事件路由與 Lane 分配的唯一權限（Step 2.11-2.13）
- **L4A**（語義決策稽核切片）：擁有稽核日誌持久化與查詢的唯一權限；欄位必須含 Who/Why/Evidence/Version/Tenant（Step 2.12）
- 任何 Slice 不可繞過 L4A 直接寫入稽核記錄；L4A 僅透過 L5 Projection Bus 物化稽核視圖

## 業務指紋更新邊界（BF-1 Behavioral Fingerprint Authority）

- **唯一觸發者**：L3 Domain Slice（D3）在確認匹配結果後觸發（Step 2.14）
- **唯一持久層**：L8（Firebase/Vector DB）的 `employees.skillEmbedding` 欄位
- FORBIDDEN：任何 L4A/L5/L6/L10 不可直接更新 `skillEmbedding`；必須透過 D3→L8 路徑（對齊 BF-1 規則）
