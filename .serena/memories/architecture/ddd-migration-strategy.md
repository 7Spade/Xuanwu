# DDD 遷移策略與平順過渡方案

## 1. 當前架構診斷

### 現狀（垂直功能切片 + 混淆層級）
```
workspace.slice/
├── core/
│   ├── _use-cases.ts         ← Application + Domain 混合
│   ├── _hooks/               ← Presentation
│   ├── _components/          ← Presentation
│   └── _actions.ts           ← Server Actions（Presentation + Application）
├── domain.tasks/
│   ├── _actions.ts           ← 業務邏輯（Application）
│   ├── _queries.ts           ← 查詢邏輯（Application）
│   ├── _types.ts             ← Domain Types
│   ├── _components/          ← Presentation
│   └── _hooks/               ← Presentation
├── domain.files/
│   └── ... 同上
├── gov.members/
│   └── ... 同上
└── index.ts                  ← Public API（暴露什麼？）
```

**層級混淆的表現：**
- `_actions.ts` 同時包含 Presentation 邏輯（狀態收集）+ Application 邏輯（命令處理）
- `_queries.ts` 混合投影邏輯和基礎設施查詢
- Domain 邏輯分散在 `domain.*/` 和 `core/` 中
- 沒有 Aggregate 邊界定義

### 現有優勢
✅ **已實施**：
- Integration Event Router (IER) 跨切片通信
- Outbox 模式（可靠事件發佈）
- 切片邊界隔離（D7：禁止直接深層導入）
- 端口介面框架（shared-kernel/ports）
- 43 個 D24 追踪（Firebase 隔離目標）

❌ **缺失**：
- Aggregate 根聚合
- 明確的 Command/Query 處理器
- Saga 編排層
- Domain Service 與 Application Service 區分
- Repository 端口實現定義

---

## 2. 遷移原則（零中斷過渡）

### 原則 A：切片公共 API 不動
```typescript
// workspace.slice/index.ts — 對外保持不變
export type { WorkspacePublicAPI } from './application';
export { createWorkspaceCommand, listTasksQuery } from './application';  // ← 旧名字保留
```

### 原則 B：內部重構不影響消費者
```typescript
// 使用向下相容的 re-export
export {
  // 新 DDD 名字
  CreateTaskHandler as handleCreateTask,
  ListTasksHandler as handleListTasks,
  
  // 舊 API 別名（遺留相容）
  handleCreateTask as createTask_legacy,
} from './application';
```

### 原則 C：遺留相容層（Adapter 模式）
```
workspace.slice/
├── application/                  ← 新 DDD 結構
├── domain/
├── infrastructure/
└── _legacy-api-adapter.ts        ← 舊 API → 新 DDD 的橋樑層
```

### 原則 D：外部事件系統不變
```typescript
// 事件形狀保持不變 — IER 和 Outbox 無需改動
export class TaskCreatedEvent implements DomainEvent {
  type = 'workspace:task:created';  // ← 保持舊名字
  // 內部實作重構，但事件形狀和路由規則不變
}
```

---

## 3. 分階段遷移計畫

### 📋 **總體時間線**

| 階段 | 目標 | 工作量 | 依賴 | 風險 |
|------|------|--------|------|------|
| **Phase 0** | 基礎層完善 | ~3 days | ✓ 開始 | 低 |
| **Phase 1** | identity.slice 試點 | ~1 week | Phase 0 | 中 |
| **Phase 2** | workspace.slice + finance.slice | ~2 weeks | Phase 1 | 中 |
| **Phase 3** | 批量遷移其他切片 | ~2-3 weeks | Phase 2 | 中 |
| **Phase 4** | D24 完全隔離 + 驗證 | ~1 week | Phase 3 | 高 |

---

## 4. Phase 0：基礎層完善（3 days）

**目標**：為整個遷移奠基，不涉及功能代碼。

### Phase 0.1：shared-kernel 增強

```typescript
// src/shared-kernel/types/aggregate-root.ts (新檔)
export interface AggregateRoot {
  readonly id: string | number;
  getUncommittedEvents(): DomainEvent[];
  clearUncommittedEvents(): void;
}

// src/shared-kernel/types/command-handler.ts (新檔)
export type CommandHandler<Cmd, Res> = (cmd: Cmd) => Promise<Res>;

// src/shared-kernel/types/query-handler.ts (新檔)
export type QueryHandler<Qry, Res> = (qry: Qry) => Promise<Res>;

// src/shared-kernel/index.ts (更新)
export { AggregateRoot, CommandHandler, QueryHandler } from './types';
```

### Phase 0.2：shared-infra 適配器框架

```typescript
// src/shared-infra/adapters/base-repository.port.ts (新檔)
export interface BaseRepositoryPort<T extends AggregateRoot> {
  save(aggregate: T): Promise<void>;
  getById(id: unknown): Promise<T | null>;
  delete(id: unknown): Promise<void>;
}

// src/shared-infra/adapters/event-bus.port.ts (新檔 — 如果尚未存在)
export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}
```

### Phase 0.3：Saga 編排框架

```typescript
// src/shared-kernel/types/saga.ts (新檔)
export interface SagaStep<Input, Output> {
  execute(input: Input): Promise<Output>;
  compensate?(output: Output): Promise<void>;
}

export class SagaOrchestrator<T extends Record<string, any>> {
  async execute(steps: SagaStep<any, any>[]): Promise<void> {
    // 標準 saga 執行邏輯
  }
}
```

### Phase 0.4：驗證與文檔

```bash
npm run test:shared-kernel
npm run check                    # 確保無新違規
```

**檢查清單**：
- [ ] shared-kernel 新 type 導出
- [ ] shared-infra 端口定義
- [ ] Saga 框架可用
- [ ] npm run typecheck 無誤

---

## 5. Phase 1：試點切片（identity.slice）

**為什麼選 identity.slice？**
- 最簡單的功能（認証 + 上下文）
- 依賴關係最少（不被其他切片深度依賴）
- 事件發出量適中
- 測試覆蓋充分

### Phase 1.1：內部重構

```
identity.slice/
├── index.ts                                   ← 公共 API 不變
├── _legacy-api-adapter.ts                     ← 遺留相容層（新）
│
├── presentation/                              ← 新結構
│   ├── components/
│   └── hooks/
│
├── application/
│   ├── commands/
│   │   ├── login.handler.ts
│   │   ├── logout.handler.ts
│   │   └── index.ts
│   ├── queries/
│   │   ├── get-current-user.handler.ts
│   │   └── index.ts
│   ├── sagas/
│   │   ├── login-saga.ts
│   │   └── index.ts
│   └── index.ts
│
├── domain/
│   ├── aggregates/
│   │   ├── user-session.aggregate.ts
│   │   └── index.ts
│   ├── value-objects/
│   │   ├── auth-token.vo.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── user-logged-in.event.ts
│   │   ├── user-logged-out.event.ts
│   │   └── index.ts
│   └── index.ts
│
├── infrastructure/
│   ├── ports/
│   │   ├── user-session.repository.port.ts
│   │   └── index.ts
│   ├── adapters/
│   │   ├── firestore/
│   │   │   ├── user-session.firestore.adapter.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
│
└── index.ts
```

### Phase 1.2：遺留相容層（關鍵）

```typescript
// identity.slice/_legacy-api-adapter.ts
import { LoginCommand } from './application/commands';
import { handleLoginCommand } from './application';

/**
 * 舊 API — 保持 Server Action 簽名向下相容
 * @deprecated 請使用 handleLoginCommand() 而不是此函數
 */
export async function loginUserAction(email: string, password: string) {
  const cmd = new LoginCommand({ email, password });
  return handleLoginCommand(cmd);
}

// identity.slice/index.ts
export { loginUserAction } from './_legacy-api-adapter';  // ← 舊 API
export { handleLoginCommand } from './application';        // ← 新 API
```

### Phase 1.3：文檔化與驗證

**遷移指南文檔**：
```markdown
# identity.slice DDD 遷移指南

## 新 API 路由

| 舊 API | 新 API | 位置 |
|--------|--------|------|
| `loginUserAction()` | `handleLoginCommand()` | `application/commands` |
| `getCurrentUser()` | `QueryGetCurrentUser` | `application/queries` |

## 事件形狀保持不變

舊事件：
```typescript
{
  type: 'identity:user:logged-in',
  payload: { userId, email },
  timestamp: Date
}
```

新事件（相同）：
```typescript
export class UserLoggedInEvent implements DomainEvent {
  readonly type = 'identity:user:logged-in';  // ← 保持
  constructor(
    readonly userId: string,
    readonly email: string
  ) {}
}
```
```

**驗證清單**：
```bash
npm run test -- identity.slice              # 單元測試
npm run build                                # 確保無編譯誤
npm run lint -- src/features/identity.slice # ESLint D7 驗證
npm run check                                # 全局架構檢查
```

**檢查項**：
- [ ] 現有 API re-export 正常工作
- [ ] 事件形狀相同，IER 路由無誤
- [ ] 新 aggregate/entity 測試覆蓋
- [ ] 無新 D7 違規（切片邊界）
- [ ] 無新 D24 違規（Firebase 隔離）

---

## 6. Phase 2：核心切片（workspace.slice + finance.slice）

### Phase 2.1：workspace.slice 遷移

**複雜度**：高（11 個子域）

```
新結構：
workspace.slice/
├── presentation/
│   ├── components/
│   ├── hooks/
│   └── (shell)/                    ← 路由層組件
│
├── application/
│   ├── commands/
│   │   ├── create-task.handler.ts
│   │   ├── update-task.handler.ts
│   │   ├── workflow-actions.handler.ts
│   │   └── index.ts
│   ├── queries/
│   │   ├── list-tasks.handler.ts
│   │   ├── get-workspace.handler.ts
│   │   └── index.ts
│   ├── sagas/
│   │   ├── task-creation-saga.ts    ← 多步 + 償卸
│   │   ├── workflow-transition-saga.ts
│   │   └── index.ts
│   └── index.ts
│
├── domain/
│   ├── aggregates/
│   │   ├── workspace.aggregate.ts   ← 工作區聚合根
│   │   ├── task.aggregate.ts        ← 任務聚合根
│   │   └── index.ts
│   ├── entities/
│   │   ├── task.entity.ts
│   │   ├── workflow-step.entity.ts
│   │   └── index.ts
│   ├── value-objects/
│   │   ├── task-status.vo.ts        ← 狀態機
│   │   ├── workflow-state.vo.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── task-scheduling.domain-service.ts
│   │   ├── workflow-validation.domain-service.ts
│   │   └── index.ts
│   ├── invariants/
│   │   ├── task-status-transitions.invariant.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── task-created.event.ts
│   │   ├── task-updated.event.ts
│   │   ├── workflow-blocked.event.ts
│   │   └── index.ts
│   └── index.ts
│
├── infrastructure/
│   ├── ports/
│   │   ├── task.repository.port.ts
│   │   ├── workspace.repository.port.ts
│   │   ├── document-parser.port.ts
│   │   └── index.ts
│   ├── adapters/
│   │   ├── firestore/
│   │   │   ├── task.firestore.adapter.ts
│   │   │   ├── workspace.firestore.adapter.ts
│   │   │   └── index.ts
│   │   ├── document-parser/
│   │   │   ├── pdf-parser.adapter.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── task.repository.ts        ← 實現端口
│   │   ├── workspace.repository.ts
│   │   └── index.ts
│   └── index.ts
│
├── _legacy-api-adapter.ts             ← 遺留相容層
├── index.ts
└── README.md
```

### Phase 2.2：finance.slice 遷移

**複雜度**：中（資金流轉相關）

類似遷移，重點在於 Saga 編排（資金校驗 → 地主扣款 → 記錄）。

### Phase 2.3：跨切片事件驗證

```bash
# 驗證 workspace + finance 的事件交互
npm run test -- workspace.slice finance.slice

# 確保 IER + Outbox 仍正常工作
npm run integration:event-bus
```

---

## 7. Phase 3：批量遷移其他切片

| 切片 | 優先級 | 依賴 | 複雜度 |
|------|--------|------|--------|
| `skill-xp.slice` | HIGH | workspace | 中 |
| `organization.slice` | HIGH | — | 中 |
| `account.slice` | MEDIUM | identity | 低 |
| `workforce-scheduling.slice` | MEDIUM | workspace | 高 |
| `notification-hub.slice` | LOW | 無 | 低 |
| `semantic-graph.slice` | LOW | — | 高 |
| `global-search.slice` | LOW | 無 | 中 |
| `portal.slice` | LOW | — | 低 |

**追蹤方式**：為每個切片創建 GitHub issue，使用 GitHub 項目看板跟蹤進度。

---

## 8. Phase 4：D24 隔離完成與驗證

### Phase 4.1：Firebase 適配器完全化

```typescript
// src/shared-infra/firebase-client/firestore/adapters/
// — 為所有 D24 違規的切片創建適配器
├── account/
├── identity/
├── workspace/
├── finance/
└── ...
```

### Phase 4.2：驗證工作流

```bash
# 掃描新 Firebase 違規
npm run lint -- --rule="D24"

# 確保只有遺留代碼有違規（43 個預期）
npm run audit:architecture

# 類型檢查
npm run typecheck

# 構建
npm run build

# 測試
npm run test
```

**成功條件**：
- [ ] 0 個新 D24 違規
- [ ] 43 個遺留違規保持（不增加）
- [ ] 所有新代碼在 infrastructure/adapters 中
- [ ] npm run check 通過

---

## 9. 遷移過程中的常見陷阱與解決方案

### 陷阱 1：打破公共 API

❌ **錯誤**：直接改變 slice/index.ts 的導出
```typescript
// workspace.slice/index.ts
// ❌ 舊代碼消費者會破裂
// export { createTaskAction } from './core/_actions';
export { handleCreateTaskCommand } from './application';  // 名字完全不同
```

✅ **解決方案**：使用相容層轉接
```typescript
// workspace.slice/_legacy-api-adapter.ts
export async function createTaskAction(...) {
  return handleCreateTaskCommand(...);
}

// workspace.slice/index.ts
export { createTaskAction } from './_legacy-api-adapter';  // 舊名字保留
export { handleCreateTaskCommand } from './application';   // 新名字並提
```

### 陷阱 2：事件形狀改變

❌ **錯誤**：新 event class 改變了事件 payload
```typescript
// 舊
{ type: 'workspace:task:created', payload: { taskId, title, ... } }

// 新（聲明式事件—改變了形狀）
new TaskCreatedEvent({ taskId, title, ... })  // 序列化後形狀不同
```

✅ **解決方案**：事件 getter 保持舊形狀
```typescript
export class TaskCreatedEvent implements DomainEvent {
  readonly type = 'workspace:task:created';
  
  // IER/Outbox 使用此方法
  toJSON() {
    return {
      type: this.type,
      payload: { taskId: this.taskId, title: this.title, ... }
    };
  }
}
```

### 陷阱 3：循環依賴

❌ **錯誤**：infrastructure adapter 導入 application command
```typescript
// workspace.slice/infrastructure/adapters/firestore/...
import { CreateTaskCommand } from '../../application';  // ❌ 反向依賴
```

✅ **解決方案**：依賴注入
```typescript
export class TaskFirestoreAdapter implements TaskRepositoryPort {
  save(aggregate: TaskAggregate): Promise<void> {
    // Aggregate 是 domain 層，沒有反向依賴
  }
}
```

### 陷阱 4：測試依賴舊層級

❌ **錯誤**：測試仍使用舊 import
```typescript
import { _internalReducer } from '@/features/workspace.slice/domain.tasks/_reducer';
```

✅ **解決方案**：更新測試使用公共 API
```typescript
import { ListTasksHandler } from '@/features/workspace.slice/application';

it('should list tasks', async () => {
  const query = new ListTasksQuery({ workspaceId: '...' });
  const result = await new ListTasksHandler(repo).handle(query);
  expect(result).toHaveLength(3);
});
```

---

## 10. 驗證檢查清單（每個 Phase）

### Phase 完成時必須檢查

```bash
# 1. 類型檢查
npm run typecheck
✓ 無類型誤

# 2. Lint（D7, D24 特別關注）
npm run lint
✓ 無新 D7 違規（切片邊界）
✓ 無新 D24 違規（Firebase）

# 3. 全局架構檢查
npm run check
✓ 路徑完整性通過
✓ 依賴方向正確

# 4. 單元測試
npm run test
✓ 所有測試通過（新增 100% 覆蓋 DDD 層）

# 5. 集成測試（如有）
npm run test:integration
✓ 跨切片事件流流通正常

# 6. 構建
npm run build
✓ Next.js 構建成功
✓ 無 bundle 大小迴歸

# 7. 運行時檢查
npm run dev
# 在 localhost:9002 測試基本功能
✓ UI 互動正常工作
✓ Server Actions 工作正常
✓ 查詢結果正確
```

---

## 11. 總結：平順過渡的關鍵

| 要點 | 做法 |
|------|------|
| **公共 API 不動** | 遺留相容層 re-export |
| **事件形狀保持** | `toJSON()` 守衛 |
| **測試優先** | Phase 0 即開始 |
| **小步快走** | Phase per 切片，不一次全部 |
| **邊界清晰** | presentation → application → domain ← infrastructure |
| **驗證每步** | npm run check + 單元測試 |

---

## 12. 後續行動

- [ ] 啟動 Phase 0（shared-kernel + shared-infra 強化）
- [ ] 準備 identity.slice 試點
- [ ] 編寫 DDD 遷移開發者指南
- [ ] 設置 GitHub issue 追踪遷移進度
- [ ] 創建 PR 模板檢查清單（DDD 層驗證）