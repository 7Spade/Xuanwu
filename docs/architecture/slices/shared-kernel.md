# VS0 · Shared Kernel（SSOT Aligned）

## 責任

Shared Kernel 是跨切片唯一契約中心；只定義契約、不承載業務規則。

## Contracts（S1~S6）

- `S1 SK_OUTBOX_CONTRACT`：at-least-once / idempotency-key / DLQ 分級
- `S2 SK_VERSION_GUARD`：`event.aggregateVersion > view.lastProcessedVersion`
- `S3 SK_READ_CONSISTENCY`：金融/授權/衝突用 `STRONG_READ`
- `S4 SK_STALENESS_CONTRACT`：`TAG<=30s`、`PROJ_CRITICAL<=500ms`、`PROJ_STANDARD<=10s`
- `S5 SK_RESILIENCE_CONTRACT`：rate-limit / circuit-break / bulkhead
- `S6 SK_TOKEN_REFRESH_CONTRACT`：Role/Policy 變更觸發 token refresh

## Core Data Contracts

- `event-envelope`（含 `traceId`，由 CBG_ENTRY 注入一次，後續唯讀 [R8]）
- `authority-snapshot`
- `skill-tier`（`getTier(xp)`，純函式，不落庫 [#12]）
- `skill-requirement`
- `command-result-contract`

## Ports（D24）

- `IAuthService`
- `IFirestoreRepo`
- `IMessaging`
- `IFileStore`

## Mandatory Rules

- `D24`：feature slice 禁止直接 import `firebase/*`
- `D8`：shared kernel 禁止 async/side effects/Firestore calls
- `D7`：跨切片只走 `index.ts`

## 審查點

- L/R/A：Layer 放置正確、Rule 無破口、Atomicity 不外漏
