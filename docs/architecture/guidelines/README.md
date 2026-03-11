# guidelines/ — L9 基礎設施層

> **層級職責**：定義 Repository 介面實作策略、EventBus Adapter 規格、外部 API Adapter 設計，以及 DB schema migration 與 idempotency 保證。
> 此層是 Hexagonal Architecture 最外圈（Adapter Ring），所有 I/O 副作用在此封裝。

---

## 設計原則

- Repository 實作必須包含：`findById`、`save`、`findByWorkspaceId`，以及依業務需求的複合查詢方法。
- 所有 DB 操作必須支援樂觀鎖（`version` field）或明確的冪等鍵（idempotency key）。
- EventBus Adapter 負責事件序列化 / 反序列化；不含任何業務邏輯。
- 外部 API Adapter 使用 Circuit Breaker 模式；超時與重試策略明確記載於此。
- `workspaceId` 必須作為 Row-Level Security 或查詢 WHERE 條件，不可省略。

---

## 本資料夾文件

| 文件 | 狀態 | 說明 |
|------|------|------|
| `infrastructure-spec.md` | ✅ 已建立 | Repository / EventBus / External API Adapter 規格、DB schema 策略 |

---

## 邊界驗證前置需求

在建立 `infrastructure-spec.md` 前，請確認以下文件已通過驗證：

- ✅ `../blueprints/application-service-spec.md` (L8) — Handler 編排已確定，可持續迭代 I/O Adapter 介面
