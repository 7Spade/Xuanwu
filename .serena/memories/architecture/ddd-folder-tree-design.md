# Xuanwu DDD 目標資料夾樹（由垂直切片漸進轉換）

## 目標原則
- 保留現有 feature slice 邊界，不做 big-bang 重寫。
- 在每個 slice 內導入 DDD 四層：presentation -> application -> domain <- infrastructure。
- 對外維持 slice `index.ts` API 穩定，內部逐步重構。

## 目標樹（建議）

```text
src/
  app/                                # Next.js route / page 組裝層
  features/
    <feature>.slice/
      index.ts                        # 對外唯一入口（穩定 API）
      presentation/                   # UI 組件與互動組裝
        components/
        hooks/
      application/                    # Use case / Command / Query / Saga
        commands/
        queries/
        sagas/
      domain/                         # 核心業務規則
        aggregates/
        entities/
        value-objects/
        services/
        events/
        invariants/
      infrastructure/                 # 具體技術實作（Adapter）
        ports/                        # 對 domain/application 暴露的抽象
        adapters/                     # Firestore, event bus, external service
        repositories/
      _legacy-api-adapter.ts          # 過渡期：舊 API -> 新 handler
  shared-kernel/                      # 跨切片共用的 VO/ports/contracts
  shared-infra/                       # 跨切片基礎設施與適配器
  app-runtime/                        # runtime providers / contexts
  lib-ui/                             # 跨切片 UI 元件
  config/
```

## 套用到現況的映射
- 目前 `domain.*`、`gov.*`、`core/` 內混合邏輯，先不刪除，分批搬入 `application/`、`domain/`、`presentation/`。
- `_actions.ts` 優先拆成 `application/commands/*`。
- `_queries.ts` 優先拆成 `application/queries/*`。
- 既有事件系統（Outbox / IER）保留，先維持事件名稱與 payload shape。

## 命名建議
- aggregate: `*.aggregate.ts`
- entity: `*.entity.ts`
- value object: `*.vo.ts`
- command/query handler: `*.handler.ts`
- repository port: `*.repository.port.ts`
- adapter: `*.<tech>.adapter.ts`

## 邊界守則
- Domain 不可直接依賴 Infrastructure。
- Slice 之間不可 deep import，僅可透過對方 `index.ts`。
- Firebase/外部 SDK 僅允許在 infrastructure/shared-infra。
