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
