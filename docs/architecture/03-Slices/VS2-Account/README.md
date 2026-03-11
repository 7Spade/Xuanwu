# VS2-Account

## Phase 0 角色：員工畫像初始化（SSOT Step 0.3）

> SSOT 參考：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` Step 0.3

**VS2 在 Phase 0（Kernel Bootstrap & Tag Ontology）中的職責：**
- `D3->>L8: 0.3 更新員工畫像與證照 (VS2 Account/Profile)` — VS2 Account Slice 在語義基石階段負責將員工畫像（profile）與證照（certifications）寫入 L8（Firebase/Vector DB），作為後續 Phase 2 匹配流程的候選人資料源
- 畫像欄位必須包含 `skillEmbedding`（由 L10 Genkit 異步填入），供 Tool-M（`match_candidates`）進行向量搜尋
- 初始化寫入需遵循 FI-002（Firestore 單一事務）與 D29（TransactionalCommand 標記）

**Phase 0.3 前置條件：**
1. VS0（Kernel/SDK）已注入共用型別與枚舉（Step 0，VS0→D3）
2. VS8 已建立 Tag Ontology Slugs（Step 0.1/0.2）作為畫像標籤的語義權威

## 一眼摘要

- 用途：維護帳號聚合（Account Aggregate）與錢包一致性，承接個人層級治理策略。
- 核心功能：account aggregate、wallet consistency、org binding、governance policy event、outbox lane discipline（`S1`）。
- 解決痛點：
	1. 帳號主資料與錢包交易分離，容易出現餘額與事件紀錄不一致。
	2. 權限/政策異動缺少事件化，難以追溯誰在何時改動治理設定。
	3. 個人帳號與組織綁定規則不清，造成跨域行為審計困難。

- Account aggregates and wallet consistency
- Org binding and governance policy events
- Outbox lane discipline (`S1`)

## Implemented Capabilities (from code)

- Profile domain: user profile create/update/query + settings/security/preferences UI.
- Wallet domain: credit/debit、balance query、transactions subscription、wallet hook。
- Governance role: assign/revoke/query account role，並觸發 claims refresh（`S6`）。
- Governance policy: create/update/delete/query account policies。
- Account event bus: `publishAccountEvent` / `onAccountEvent`。

## Boundary Note

- Organization 子域能力（members/partners/policy/teams/core/event-bus）已遷移至 VS4 `organization.slice`。
- `FI-002`: 帳戶與錢包寫入必須在單一 Firestore 事務中完成。
- `D29`: 帳戶命令（CreateAccount/UpdateProfile）必須攜帶 TransactionalCommand 標記。
- `LANE`: RoleChanged / PolicyChanged 事件走 CRITICAL_LANE；AccountCreated 走 STANDARD_LANE。
