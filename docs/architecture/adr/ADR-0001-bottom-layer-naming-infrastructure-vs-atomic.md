# ADR-0001：底層命名 — 基礎設施層（L9）vs. 原子操作層

- **Status**: Accepted
- **Date**: 2026-03-12
- **Deciders**: Architecture Team（xuanwu-commander）

---

## Context

在設計 L8/L9 底層時，出現兩種命名候選：
1. **原子操作層**（Atomic Operation Layer）
2. **基礎設施層**（Infrastructure Layer）

兩者命名都曾被提出，但「原子操作」有語意歧義，需要做出明確決策並記錄。

---

## Decision

採用 **基礎設施層（L9 Infrastructure Layer）**，搭配 **應用服務層（L8 Application Service Layer）**，共 2 個底層。

---

## Rationale

「原子操作」有兩種語意，兩者均已在其他層處理：

| 語意 | 已歸屬層 | 說明 |
|------|---------|------|
| ACID 原子性（DB transaction） | L9 Repository 內部機制 | DB transaction 屬儲存 adapter 的實作細節 |
| 原子動作（Command 最小操作） | L7 Contract 層（Command/Event 型別定義） | 每個 Command 本身即為最小可執行單元 |

「基礎設施層」對應 Hexagonal Architecture 的外部 Adapter Ring（Repo、EventBus、外部 API），職責邊界清晰：
- 與 L6 Domain Model 的 Port 定義形成互補（L6 定義介面，L9 實作適配）
- 符合 Clean Architecture 最外圈（Infrastructure / Framework 圈）命名慣例
- 避免與 L7 Contract 的「原子 Command」語義混淆

---

## Consequences

**正面影響**：
- 命名與 Hexagonal Architecture 標準術語對齊，降低新成員認知負擔。
- L8（業務編排）與 L9（技術適配）職責截然分明，符合 SRP。

**負面影響**：
- 「基礎設施」範疇較廣，實作者需遵守 `infrastructure-spec.md` 明確界定 L9 邊界，避免業務邏輯滲透。

---

## Alternatives Considered

| 選項 | 拒絕原因 |
|------|---------|
| 原子操作層（L8+L9 合一） | 違反 SRP；業務 Saga 與 DB Adapter 責任混合 |
| 原子操作層（僅 L9） | 語意不精確；L9 的責任是 I/O 適配，非原子性保障 |
| 只有一個底層（L8/L9 合一） | Saga 與 Repository 若在同一層，測試隔離性差 |

---

## References

- [L8 Application Service 設計](../blueprints/application-service-spec.md)
- [L9 Infrastructure 實作規格](../guidelines/infrastructure-spec.md)
