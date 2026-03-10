# VS5-Workspace

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

4. Governance
- `gov.role`: workspace role assign/revoke/query。
- `gov.audit`: audit log write/query 與 timeline UI。
- `gov.members`: member grants 與成員面板。

5. Domain capabilities
- `domain.files`: 檔案建立、版本管理、復原、上傳（daily/task/profile/raw）。
- `domain.document-parser`: ParsingIntent 建立/導入狀態追蹤/訂閱。
- `domain.tasks`: task CRUD、批次導入、sourceIntent 對應查詢。
- `domain.workflow`: stage transition、blockedBy(issue) 處理、workflow 持久化。
- `domain.daily`: 日誌建立/聚合與互動。
- `domain.quality-assurance` / `domain.acceptance`: QA 與驗收能力入口。
- `domain.issues`: issue 建立/留言/解決。

6. Finance migration note
- VS5 的 finance capability 已遷移到 `@/features/finance.slice`（VS9）。
- `workspace.slice` 目前僅保留 backward-compatible re-export。
