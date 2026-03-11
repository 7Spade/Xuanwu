# [索引 ID: @VS9-FIN] Finance Lifecycle

## Scope

VS9 負責金融流程聚合，不接管 VS5 任務狀態機。VS9 與其他切片的協作必須經 L4 事件與 L5 投影。

## Write Path (L2/L3/L4)

1. 入口命令由 L2 `Command Gateway` 收口。
2. VS9 只維護 `Finance_Request` 與金融流程狀態。
3. 事件透過 L4 IER 分發，不允許 slice-to-slice 直接寫入。

## Read Path (L5/L6)

- L5 讀模型：
  - `finance-staging-pool`（`A20`）
  - `task-finance-label-view`（`A22`）
- L6 只暴露上述讀模型，不提供跨域 Aggregate 直讀。

## Invariants 引用

- `A20`: Staging pool 唯一寫入路徑。
- `A21`: Finance_Request 獨立生命週期。
- `A22`: 金融狀態逆向回饋必經投影。
- `D29`: Aggregate + outbox 同交易。
- `S2`: Projection 版本守衛。

## Forbidden Paths

- FORBIDDEN: VS9 直接寫入 VS5 任務 Aggregate。
- FORBIDDEN: 前端直讀 VS9 內部狀態合成任務顯示（必須經 `task-finance-label-view`）。
- FORBIDDEN: 在 Transaction 外先寫 Aggregate 再補寫 Outbox。

## Phase 對齊規則補充（SSOT Alignment Addendum）

| 規則 | 類型 | 說明 |
|------|------|------|
| `FI-002` | MUST | Finance 狀態轉換寫入必須使用 Firestore 單一事務（補強 D29 TransactionalCommand 保障） |
| `LANE-C` | MUST | InvoiceRequested / PaymentReceived → CRITICAL_LANE（SLA ≤ 500ms） |
| `LANE-S` | MUST | FinanceDraftCreated / FinanceSubmitted → STANDARD_LANE（SLA ≤ 10s） |
| `E8-VS9` | MUST | Finance 查詢和寫入操作必須帶 tenantId；跨租戶金融資料一律 fail-closed |
| `L4A-Finance` | SHOULD | 重大金融決策（Approved / Disbursing）應記錄 L4A 稽核日誌（Who/Why/Evidence/Version/Tenant） |
