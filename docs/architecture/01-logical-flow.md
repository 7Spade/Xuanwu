# 邏輯流視圖 (Logical Flow View)

此檔是流程可讀性視圖，非規則正文。  
規則正文請見 `02-governance-rules.md`；路徑映射請見 `03-infra-mapping.md`。

## 讀法

1. 先看三條主鏈。
2. 再看 Firebase A/B 路由決策。
3. 最後對照 `02` 的規則 ID。

## 三條主鏈（最小版）

| 鏈路 | 流向 | 主要約束 |
|---|---|---|
| 寫鏈 | `L0 -> L0A(CMD) -> L2 -> L3 -> L4 -> L5` | `D29` / `S2` / `R8` |
| 讀鏈 | `L0/UI -> L0A(QRY) -> L6 -> L5` | `S3` / `D31` |
| Infra 鏈 | A: `L3/L5/L6 -> L1 -> L7-A -> L8`；B: `L0/L2 -> L7-B -> L8` | `D24` / `D25` / `E7/E8` |

## Firebase 路由決策（A/B）

- A 路（`L7-A`）：使用者會話內、Rules 可封閉、低延遲互動。
- B 路（`L7-B`）：Admin 權限、跨租戶、排程/Webhook、高扇出協調。
- `firebase-admin` 僅允許在 `functions` 容器內使用（`D25`）。

## Auxiliary Slice 邊界（現況）

- `global-search.slice`：系統唯一跨域搜尋入口；查詢路徑應對接 VS8 語義索引與 L6 讀取出口。VS8 架構詳見 [`03-Slices/VS8-SemanticBrain/architecture.md`](03-Slices/VS8-SemanticBrain/architecture.md) 與 [`03-Slices/VS8-SemanticBrain/architecture-diagrams.md`](03-Slices/VS8-SemanticBrain/architecture-diagrams.md)。
- `portal.slice`：門戶殼層 state 橋接；不取代 L2/L3 業務決策，不可繞過主鏈。

## VS9 Finance 流向索引

- 入口：`TaskAcceptedConfirmed` 經 L4 `CRITICAL_LANE` 進入 L5 `finance-staging-pool`（`A20`）。
- 主體：`Finance_Request` 維持獨立生命週期（`A21`）。
- 回饋：金融狀態經 L5 `task-finance-label-view` 回傳讀側（`A22`）。

## 系統架構圖（精簡）

```mermaid
flowchart TD
  subgraph WritePath[Write Path]
    EXT[L0 External Triggers] --> CMD[L0A CMD_API_GW]
    CMD --> CBG[L2 Command Gateway]
    CBG --> DOM[L3 Domain Slices]
    DOM --> IER[L4 IER]
    IER --> PB[L5 Projection Bus]
  end

  subgraph ReadPath[Read Path]
    UI[L0 UI] --> QRY[L0A QRY_API_GW]
    QRY --> QG[L6 Query Gateway]
    QG --> PB
  end

  subgraph InfraPath[Infra Path]
    DOM --> PORTS[L1 SK_PORTS]
    PB --> PORTS
    QG --> PORTS
    PORTS --> A[L7-A firebase-client]
    CBG --> B[L7-B functions/admin]
    A --> L8[L8 Firebase Runtime]
    B --> L8
  end

  L10[L10 AI Runtime] --> CBG
  L10 --> QG
  IER -. metrics .-> L9[L9 Observability]
  CBG -. trace .-> L9
```

## 圖後索引（精簡）

- 規則正文：`02-governance-rules.md`
- 路徑與 Adapter：`03-infra-mapping.md`
- 拓撲裁決：`00-logic-overview.md`

## 核心審查提示

- 若看見讀鏈直接回寫，視為違規。
- 若看見 feature 直連 Firebase SDK，視為違規。
- 若看見 VS8 直接執行副作用，視為違規。
- 若看見除 `global-search.slice` 之外的跨域搜尋權威入口，視為違規。
