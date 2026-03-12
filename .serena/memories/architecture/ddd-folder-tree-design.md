# DDD 架構資料夾樹設計（Xuanwu 漸進式遷移）

## 1. 現狀分析

**當前架構**：垂直功能切片（Feature-Sliced Design）
```
src/
├── features/
│   ├── workspace.slice/           ← 單一功能垂直切片
│   │   ├── domain.tasks/          ← 域邏輯
│   │   ├── domain.files/          ← 域邏輯
│   │   ├── _actions.ts            ← Server Actions（混合層級）
│   │   ├── _queries.ts            ← 查詢（混合層級）
│   │   └── _components/           ← React Components（表現層）
│   ├── finance.slice/
│   └── ...其他功能切片
├── shared-kernel/                 ← 共享域模型
├── shared-infra/                  ← 共享基礎設施
└── app-runtime/                   ← 應用運行時（中間件等）
```

**問題**：層級混淆、責任不清、側效應分散

---

## 2. 目標架構（DDD + Feature Slice 混合）

採用 **DDD 四層 + Feature Slice** 混合模式：每個功能切片內部按照 DDD 四層組織。

```
src/
├── app/                                 ← L0: Presentation (Next.js App Router)
│   ├── (shell)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── workspace/
│   │   │   ├── [workspaceId]/
│   │   │   │   ├── layout.tsx        ← Route Handler + Metadata
│   │   │   │   ├── page.tsx          ← Server Component
│   │   │   │   └── tasks/
│   │   │   │       └── [taskId]/page.tsx
│   │   │   └── ...
│   │   └── ...
│   └── api/
│       └── [route]/route.ts          ← Route Handlers (if needed)
│
├── features/                            ← L1-L3: Domain + Application (Feature Slices)
│   │
│   ├── workspace.slice/
│   │   ├── index.ts                   ← Public API barrel
│   │   │
│   │   ├── presentation/              ← L0: Presentation Components
│   │   │   ├── components/
│   │   │   │   ├── workspace-header.tsx
│   │   │   │   ├── task-card.tsx
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── use-workspace.ts
│   │   │   │   └── ...
│   │   │   └── _layout-providers.tsx
│   │   │
│   │   ├── application/                ← L2: Application Layer
│   │   │   ├── commands/
│   │   │   │   ├── create-task.handler.ts
│   │   │   │   ├── update-task.handler.ts
│   │   │   │   ├── delete-task.handler.ts
│   │   │   │   └── index.ts
│   │   │   ├── queries/
│   │   │   │   ├── get-workspace.handler.ts
│   │   │   │   ├── list-tasks.handler.ts
│   │   │   │   └── index.ts
│   │   │   ├── sagas/
│   │   │   │   ├── task-creation-saga.ts  ← 多步驟事務
│   │   │   │   ├── task-workflow-saga.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── domain/                     ← L3: Domain Layer
│   │   │   ├── aggregates/
│   │   │   │   ├── workspace.aggregate.ts
│   │   │   │   ├── task.aggregate.ts
│   │   │   │   └── index.ts
│   │   │   ├── entities/
│   │   │   │   ├── task.entity.ts
│   │   │   │   ├── team-member.entity.ts
│   │   │   │   └── index.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── workspace-id.vo.ts
│   │   │   │   ├── task-status.vo.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── task.domain-service.ts
│   │   │   │   ├── scheduling.domain-service.ts
│   │   │   │   └── index.ts
│   │   │   ├── invariants/
│   │   │   │   ├── task-status-transitions.invariant.ts
│   │   │   │   └── index.ts
│   │   │   ├── events/
│   │   │   │   ├── task-created.event.ts
│   │   │   │   ├── task-updated.event.ts
│   │   │   │   ├── task-completed.event.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── infrastructure/              ← L4: Infrastructure Layer
│   │   │   ├── ports/
│   │   │   │   ├── task.repository.port.ts
│   │   │   │   ├── workspace.repository.port.ts
│   │   │   │   ├── event-bus.port.ts
│   │   │   │   └── index.ts
│   │   │   ├── adapters/
│   │   │   │   ├── firestore/
│   │   │   │   │   ├── task.firestore.adapter.ts
│   │   │   │   │   ├── workspace.firestore.adapter.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── event-bus/
│   │   │   │   │   ├── event-bus.adapter.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── repositories/
│   │   │   │   ├── task.repository.ts
│   │   │   │   ├── workspace.repository.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                   ← Public API（只暴露 application commands/queries）
│   │
│   ├── finance.slice/                 ← 同樣的 DDD 四層結構
│   │   ├── presentation/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── index.ts
│   │
│   └── ...其他功能切片
│
├── shared-kernel/                      ← L3: 共享域層（跨切片共用）
│   ├── value-objects/
│   │   ├── workspace-id.vo.ts
│   │   ├── task-id.vo.ts
│   │   ├── money.vo.ts
│   │   └── index.ts
│   ├── ports/                         ← 共享端口定義
│   │   ├── auth.service.port.ts
│   │   ├── storage.service.port.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── domain-event.base.ts
│   │   ├── ...公共事件定義
│   │   └── index.ts
│   ├── types/
│   │   ├── result.ts                  ← Result<T, E> 類型
│   │   ├── aggregate-root.ts          ← Aggregate Root 基類
│   │   └── index.ts
│   ├── constants/
│   ├── schemas/
│   └── index.ts
│
├── shared-infra/                       ← L4: 共享基礎設施層
│   ├── firebase-admin/
│   ├── firebase-client/
│   │   ├── firestore/
│   │   │   ├── repositories/          ← Firestore 適配器
│   │   │   │   └── task.repository.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── event-bus/
│   │   ├── memory-event-bus.ts
│   │   ├── firestore-outbox.ts
│   │   └── index.ts
│   ├── gateway-command/               ← 適配層（遺留相容）
│   ├── gateway-query/
│   ├── observability/
│   ├── projection-bus/
│   └── index.ts
│
├── app-runtime/                        ← Application Providers + Middleware
│   ├── ai/
│   ├── contexts/
│   ├── providers/
│   └── index.ts
│
├── lib-ui/                             ← UI 元件庫（跨切片共用）
│   ├── shadcn-ui/
│   ├── custom-ui/
│   └── index.ts
│
├── config/                             ← 配置層
│   ├── i18n/
│   └── index.ts
│
└── globals.css
```

---

## 3. 層級職責詳解

| 層級 | 資料夾 | 責任 | 範例 |
|------|--------|------|------|
| **L0** | `app/` + `presentation/` | UI 渲染、路由驅動、事件收集 | `.tsx` components、React hooks |
| **L2** | `application/` | Use cases、command/query handlers、saga 編排 | `CreateTaskHandler`、`ListTasksHandler` |
| **L3** | `domain/` | 商業邏輯、不變性、事件定義 | `TaskAggregate`、`TaskCreatedEvent` |
| **L4** | `infrastructure/` | 外部依賴、資料庫存取、適配器 | Firestore 適配器、Event Bus |
| **共用** | `shared-kernel/` + `shared-infra/` | 跨切片公共概念、技術基礎 | `WorkspaceId` VO、Firebase SDK |

---

## 4. 遷移戰略（漸進式）

### Phase 1：基礎層建立
```
✓ shared-kernel/value-objects/       （已完成）
✓ shared-kernel/ports/                （已完成）
✓ shared-kernel/types/                （已完成）
→ shared-infra/adapters/firestore/    （進行中）
```

### Phase 2：single slice DDD 化（workspace.slice 為例）
```
1. 抽取 workspace.slice 內 domain/* 內容到 domain/ 文件夾
2. 將 _actions.ts 重構為 application/commands/
3. 將 _queries.ts 重構為 application/queries/
4. 創建 infrastructure/repositories/ 封裝 Firestore 邏輯
5. 將現有 _components/ 移入 presentation/
6. 更新 index.ts 暴露公共 API（命令、查詢、事件）
```

### Phase 3：跨功能切片遷移
```
重複 Phase 2，逐個遷移其他切片
```

### Phase 4：架構驗證
```
- 驗證依賴方向：Presentation → Application → Domain ← Infrastructure
- 驗證切片邊界：只通過 index.ts 暴露 API
- 驗證副作用隔離：副作用只在 Application + Infrastructure 層
```

---

## 5. 命名約定

| 物件類型 | 命名 | 範例 |
|---------|------|------|
| Aggregate | `{Entity}.aggregate.ts` | `task.aggregate.ts` |
| Entity | `{Entity}.entity.ts` | `task-member.entity.ts` |
| Value Object | `{Name}.vo.ts` | `task-status.vo.ts` |
| Domain Service | `{Service}.domain-service.ts` | `task-scheduling.domain-service.ts` |
| Domain Event | `{Action}.event.ts` | `task-created.event.ts` |
| Command Handler | `{Action}.handler.ts` | `create-task.handler.ts` |
| Query Handler | `{Query}.handler.ts` | `list-tasks.handler.ts` |
| Repository Port | `{Entity}.repository.port.ts` | `task.repository.port.ts` |
| Repository Adapter | `{Entity}.{Tech}.adapter.ts` | `task.firestore.adapter.ts` |
| Saga | `{Process}-saga.ts` | `task-creation-saga.ts` |

---

## 6. 注意事項

⚠️ **不要**：
- 在 Domain 層匯入 Infrastructure 層代碼
- 在 Presentation 層直接操作 Aggregate
- 跨功能切片直接訪問（需通過公共 API）

✅ **要**：
- Presentation → Application → Domain（單向依賴）
- 使用端口介面（ports）定義 Infrastructure 依賴
- 通過事件進行跨切片通信
- 每個 index.ts 都是該層級的公共 API 邊界

---

## 7. 文件模板

### Aggregate Template
```typescript
// workspace.slice/domain/aggregates/task.aggregate.ts
import type { AggregateRoot, Result } from '@/shared-kernel';

export class TaskAggregate implements AggregateRoot {
  readonly id: TaskId;
  private status: TaskStatus;
  private events: DomainEvent[] = [];

  static create(props: TaskCreateProps): Result<TaskAggregate, TaskError> {
    // 驗證不變性
    // 創建聚合根
    // 返回 Result
  }

  applyEvent(event: DomainEvent): void {
    // 依事件更新狀態
  }

  getUncommittedEvents(): DomainEvent[] {
    return this.events;
  }
}
```

### Command Handler Template
```typescript
// workspace.slice/application/commands/create-task.handler.ts
import type { ITaskRepository } from '../ports';
import type { TaskCreatedEvent } from '../../domain';

export async function handleCreateTask(
  cmd: CreateTaskCommand,
  repo: ITaskRepository,
  eventBus: IEventBus
): Promise<Result<TaskId, TaskError>> {
  // 驗證命令
  // 使用 domain logic（Aggregate）建立任務
  // 調用 repository 持久化
  // 發佈事件
  // 返回 Result
}
```

### Repository Port Template
```typescript
// workspace.slice/infrastructure/ports/task.repository.port.ts
import type { TaskAggregate } from '../../domain';

export interface ITaskRepository {
  save(aggregate: TaskAggregate): Promise<void>;
  getById(id: TaskId): Promise<TaskAggregate | null>;
  delete(id: TaskId): Promise<void>;
}
```

---

## 8. 後續行動

- [ ] 確認 workspace.slice 為 Phase 2 試點
- [ ] 建立上述資料夾結構
- [ ] 遷移 workspace.slice 相關代碼
- [ ] 執行 npm run check（架構驗證）
- [ ] 遷移其他功能切片
- [ ] 更新 docs/architecture/README.md 展示新結構