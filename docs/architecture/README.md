# Architecture Documentation

**Project:** Xuanwu  
**Canonical SSOT for all architectural decisions.**

---

## Navigation

| 文件 | 說明 |
|------|------|
| [Model-Driven Hexagonal Architecture](./notes/model-driven-hexagonal-architecture.md) | 整體架構設計：六邊形架構、垂直切片、CQRS、Outbox、事件驅動、依賴規則 |

---

## Quick Reference

- **Vertical Slices (VS0–VS9):** `src/features/` — each slice owns its commands, queries, and domain model
- **Shared Kernel (VS0):** `src/shared-kernel/` — zero-I/O contracts, port interfaces, data contracts
- **Command Gateway:** `src/shared-infra/gateway-command/` — unified write entry point `[R4][E4][R8][Q4]`
- **Query Gateway:** `src/shared-infra/gateway-query/` — unified read entry point `[Q8][P4][R7]`
- **Outbox + IER:** `src/shared-infra/outbox-relay/` + `src/shared-infra/event-router/` — reliable async delivery `[R1][R2]`
- **Infrastructure Adapters:** `src/infrastructure/` — Firebase, Upstash, Google Document AI

---

> For full architecture details see: [notes/model-driven-hexagonal-architecture.md](./notes/model-driven-hexagonal-architecture.md)
