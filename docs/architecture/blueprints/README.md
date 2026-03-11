# blueprints/ — L8 應用服務層

> **層級職責**：設計 Command Handler、Query Handler 編排邏輯，以及跨聚合/跨工作區的 Saga 流程。
> 此層是「業務編排」的主場；副作用（DB 寫入、外部 API 呼叫）均委派至 L9（基礎設施）。

---

## 設計原則

- Command Handler 執行順序：可用性檢查 → 門檻驗證 → 聚合方法呼叫 → Repository 持久化 → 領域事件發布。
- Saga 負責跨聚合/跨工作區的補償（Compensating Transaction）；每個 Saga step 必須可冪等重試。
- Query Handler 只讀取投影（projection）或 Read Model，不調用聚合方法。
- 所有 Handler 只依賴 L7 契約型別與 L6 領域介面；不直接導入 L9 實作類別。

---

## 本資料夾文件

| 文件 | 狀態 | 說明 |
|------|------|------|
| `application-service-spec.md` | ✅ 已建立 | Command Handler 步驟規格 + Saga 流程圖（含跨工作區指派 Saga） |

---

## 邊界驗證前置需求

在建立 `application-service-spec.md` 前，請確認以下文件已通過驗證：

- ✅ `../specs/contract-spec.md` (L7) — Command/Event 型別已確定，可持續迭代
