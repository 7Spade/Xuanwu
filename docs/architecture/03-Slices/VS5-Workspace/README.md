# VS5-Workspace

## 一眼摘要

- 用途：承接工作空間內文件、任務、流程與協作操作，是業務執行面的主工作台切片。
- 核心功能：workspace item/task/workflow lifecycle、document parser + semantic classification bridge（`#A14` `D27`）、finance stage gate 與 request lifecycle 對接（`#A15` `#A21` `#A22`）。
- 解決痛點：
	1. 工作項目（檔案/任務/流程）狀態分散，難以維持單一真實來源。
	2. 文件解析與語義判斷未串接時，任務產生與成本語義容易失真。
	3. 任務與財務生命週期耦合過深，導致責任邊界不清與回寫風險。

- Workspace item/task/workflow lifecycle
- Document parser + semantic classification bridge (`#A14` `D27`)
- Finance stage gate and request lifecycle (`#A15` `#A21` `#A22`)

## Code-backed Capability Map

以下能力由 `src/features/workspace.slice/index.ts` 對外匯出，可直接對應實作模組：

1. Core workspace
- workspace 建立/更新/刪除與 capability/location 管理。
- workspace provider、shell、列表/卡片/表格/狀態列 UI。

2. Eventing
- `core.event-bus`: workspace 事件總線、funnel 註冊、projection replay。
- `core.event-store`: append-only domain event 存取（replay/audit）。

3. Application boundary
- command 執行、scope guard、policy engine、transaction runner、outbox 建立。
- org policy cache：`registerOrgPolicyCache` / `getCachedOrgPolicy` / `getAllCachedPolicies` / `clearOrgPolicyCache`。

4. Governance
- `gov.role`: workspace role assign/revoke/query。
- `gov.audit`: audit log write/query 與 timeline UI。
- `gov.audit-convergence`: audit bridge / query adapter（`toAuditProjectionQuery`）。
- `gov.members`: member grants 與成員面板。

5. Domain capabilities
- `domain.files`: 檔案建立、版本管理、復原、上傳（daily/task/profile/raw）。
- `domain.document-parser`: ParsingIntent 建立/導入狀態追蹤/訂閱。
- `domain.parsing-intent`: ParsingIntent 數位孿生契約（`createParsingIntentContract` / `markParsingIntentContract` / `supersedeParsingIntent`）。
- `domain.tasks`: task CRUD、批次導入、sourceIntent 對應查詢。
- `domain.workflow`: stage transition、blockedBy(issue) 處理、workflow 持久化。
- `domain.daily`: 日誌建立/聚合與互動。
- `domain.quality-assurance` / `domain.acceptance`: QA 與驗收能力入口。
- `domain.issues`: issue 建立/留言/解決。

6. Workspace rules
- `filterVisibleWorkspaces` / `hasWorkspaceAccess` / `isWorkspaceVisibleToUser` / `buildTaskTree`（純函數謂詞，無 SDK 依賴）。

7. Finance migration note
- VS5 的 finance capability 已遷移到 `@/features/finance.slice`（VS9）。
- `workspace.slice` 目前僅保留 backward-compatible re-export。

## Detailed Container Map

- `03-logical-containers.md`: `workspace.slice` 邏輯容器、責任與主要匯出能力總表。
