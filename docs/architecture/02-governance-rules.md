# 治理規則（Governance Rules Canonical）

本檔是規則正文 SSOT。  
`00` 負責拓撲裁決，`03` 負責路徑映射，`01` 僅為流程可讀視圖。

## 分類

| 類型 | 代碼 | 定義 |
|---|---|---|
| Hard Invariants | `R / S / A / #` | MUST，長期穩定不變量 |
| Governance | `D / P / T / E` | SHOULD（命中特定控制面時可升級為 MUST） |
| Forbidden | `FORBIDDEN` | MUST NOT，絕對禁止 |

## 審查門（Review Gates）

1. Layer Gate：鏈路與層位方向正確。
2. Rule Gate：命中規則 ID 必須可追溯。
3. Contract Gate：經 SK_PORTS 與公開 API。
4. Atomicity Gate：命令原子性與 outbox 一致。

## 核心規則索引（必審）

| ID | 規則 |
|---|---|
| `R8` | traceId 僅入口注入一次，全鏈唯讀 |
| `R9` | context propagation 由中介層維持，禁止業務碼手動傳遞 |
| `S1` | Outbox contract：至少一次 + idempotency + DLQ 分級 |
| `S2` | Projection 版本守衛（只前進不回退） |
| `S3` | STRONG_READ / EVENTUAL_READ 分流 |
| `S4` | staleness SLA 常數化（禁止硬寫） |
| `D24` | Feature slice 禁止直接 import `@/shared-infra/*` 具體實作 |
| `D24-D` | Client -> Server 僅 plain DTO，不可傳 rich entity |
| `D25` | Next.js server/edge/action 禁止直接 import `firebase-admin` |
| `D26` | Cross-cutting authority 不得寄生 shared-kernel |
| `D27` | 成本語義由 VS8 決策，VS5 document-parser 不可自判 |
| `D28` | 視覺化元件禁止直連 Firebase，必須經 `VisDataAdapter` |
| `D29` | Transactional outbox：Aggregate 與 outbox 同交易 |
| `D30` | hop-limit 循環防禦；SECURITY_BLOCK 禁止自動 replay |
| `D31` | 讀路徑權限一致性依賴 `acl-projection` |
| `E7` | App Check/security gate 不可繞過 |
| `E8` | AI flow 禁止直接呼叫 `firebase/*` 或跨租戶讀寫 |
| `A19` | VS5 任務狀態封閉生命週期 |
| `A20` | Finance staging pool 唯一寫入路徑 |
| `A21` | Finance_Request 獨立生命週期 |
| `A22` | Finance 狀態回饋必經 L5 label projection |

## VS8（Memory & Feedback Brain）規則集

### G（Governance）

- `G1`：全域語義標籤 SSOT 由治理流程維護。
- `G3/G4`：禁止繞過 invariant guard 與 canonical write path。
- `G7`：跨切片語義訊號必帶 `semanticTagSlugs`。

### C（Core Domain）

- `C1`：VS8 維護主體圖，不承載因果執行副作用。
- `C3`：邊權重由 weight calculator 統一計算。
- `C11`：禁止純向量作最終分類。

### E（Compute Engine）

- `E4/E5`：分類與推理必走統一路徑，不可字串硬判。
- `E6`：推理結果必帶 `inferenceTrace[]`。
- `E11`：routing engine 只輸出 hint，不執行副作用。

### O（Output）

- `O1`：對外只經 Port 介面。
- `O2`：讀取以 projection 為唯一路徑。
- `O5/O6`：outbox 與 IER 路徑單一，不可重複定義。

### B（Boundary）

- `B1`：VS8 禁止直接觸發跨切片副作用。
- `B3`：AI flow 僅可透過 port 使用 VS8。
- `B4/B5`：分類學與向量不可互相取代；VS8 不做因果執行。

### D21-MF（記憶回饋閉環）

- `D21-MF1`：L10 pre-parse 僅能讀 `memory-snippet-view` / `feedback-pattern-view`。
- `D21-MF2`：人工修正必須事件化，不可直接覆寫分類規則。
- `D21-MF3`：採納率與誤判率必須落到 `memory-quality-view` 並進 L9 指標。

## Forbidden（精簡主清單）

- 禁止跨切片直接寫他域 Aggregate。
- 禁止 Transaction 外雙重寫入（先 aggregate 後 outbox）。
- 禁止 Feature slice 直連 `firebase/*`、`firebase-admin`。
- 禁止 Query 路徑反向驅動 Command 路徑。
- 禁止 VS8 直接觸發 VS5/VS6/VS7 副作用。
- 禁止繞過 `VisDataAdapter` 直連可視化資料來源。
- 禁止繞過 `acl-projection` 在讀路徑重算高成本鑑權。

## 跨切片強制規則（摘要）

- VS5：任務生命週期與金融入口門檻（`A19/A20`）。
- VS8：語義計算與邊界規則（`G/C/E/O/B + D21-MF`）。
- VS9：Finance_Request 獨立狀態機與回饋投影（`A21/A22`）。
- VS6/VS7：排班與通知均不得繞過事件/投影鏈路。

## 變更協議

1. 新規則先在本檔建立 canonical body。
2. 再同步 `00` 的索引與裁決語句。
3. 必要時更新 `03` 的實體路徑映射。
4. `01` 僅更新圖與閱讀指引，不重寫規則正文。
