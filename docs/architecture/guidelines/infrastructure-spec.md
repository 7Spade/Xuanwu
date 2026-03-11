# L9 基礎設施規格 — Infrastructure Specification

> **層級定位**：本文件定義 L9 基礎設施層的所有 Adapter、Repository 模式、EventBus 規格，以及 IdempotencyStore 和 OptimisticLock 的實作細節。
> 來源：[ADR-0001 基礎設施層命名決策](../adr/ADR-0001-bottom-layer-naming-infrastructure-vs-atomic.md)、[L5 Guards SB51-SB53](../use-cases/use-case-diagram-sub-behavior.md)、[L8 Application Service Spec](../blueprints/application-service-spec.md)

---

## 一、層結構

```
L9 基礎設施層
  ├── Repository 層（DB Adapters）
  │     ├── TaskItemRepository（Postgres）
  │     ├── PostRepository（Postgres）
  │     ├── ScheduleItemRepository（Postgres）
  │     ├── UserSkillRepository（Postgres）
  │     └── FeedProjectionRepository（Postgres read model）
  │
  ├── EventBus（事件匯流排）
  │     ├── LocalEventBus（dev/test）
  │     └── KafkaAdapter / SQS Adapter（production）
  │
  ├── IdempotencyStore
  │     └── RedisIdempotencyStore
  │
  ├── StorageAdapter
  │     └── S3 / GCS Adapter（post_media uploads）
  │
  └── External Adapters
        ├── NotificationGateway（Push / Email）
        └── AiServiceAdapter（skill matching suggestion）
```

---

## 二、Repository 介面規格

### 通用 Repository 介面

```typescript
/**
 * L9 Repository 基礎介面
 * 所有 Aggregate Repository 必須實作
 */
interface AggregateRepository<T extends AggregateRoot, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(aggregate: T): Promise<void>;  // 包含 version++ 和 events 收集
  findByWorkspaceId(workspaceId: string, opts?: QueryOptions): Promise<T[]>;
}
```

### TaskItemRepository

```typescript
interface TaskItemRepository extends AggregateRepository<TaskItem> {
  /** WBS 樹查詢：取得節點及所有子孫 */
  findTreeByRootId(rootId: string): Promise<TaskItem[]>;

  /** 依賴 DAG 查詢：取得直接依賴的 task ids（for DFS use） */
  findDependencies(taskId: string): Promise<string[]>;

  /** 批次儲存（CopyTaskTree Saga 使用） */
  saveAll(tasks: TaskItem[]): Promise<void>;
}
```

### PostRepository

```typescript
interface PostRepository extends AggregateRepository<Post> {
  findByWorkspaceId(workspaceId: string, opts?: QueryOptions): Promise<Post[]>;
  findByOrgId(orgId: string, opts?: QueryOptions): Promise<Post[]>;
}
```

### UserSkillRepository

```typescript
interface UserSkillRepository extends AggregateRepository<UserSkill> {
  findByUserAndSkill(userId: string, skillId: string): Promise<UserSkill | null>;
  findAllByUserId(userId: string): Promise<UserSkill[]>;
  findSkillMintLogById(mintLogId: string): Promise<SkillMintLog | null>;
}
```

### FeedProjectionRepository（Read Model — 非標準 Aggregate Repo）

```typescript
/** 
 * feed_projection 為 read model，不遵循 AggregateRepository 模式。
 * 只有 FeedProjectionPipeline (L8 Saga) 可呼叫 upsert。
 * Query 端分開定義。
 */
interface FeedProjectionRepository {
  /** Idempotent 寫入（ON CONFLICT source_post_id DO UPDATE）*/
  upsert(projection: FeedProjection): Promise<void>;
  /** 隱藏投影（PostArchived 時呼叫）*/
  hide(sourcePostId: string): Promise<void>;
  /** 查詢 org 動態 */
  findByOrgId(orgId: string, cursor?: string, limit?: number): Promise<FeedProjection[]>;
}
```

---

## 三、EventBus 規格

### EventBus 介面

```typescript
interface EventBus {
  /** 發布單一事件 */
  publish<E extends DomainEvent>(event: E): Promise<void>;
  /** 批次發布（原子性，all-or-nothing） */
  publishAll<E extends DomainEvent>(events: E[]): Promise<void>;
  /** 訂閱事件（Saga / Pipeline 使用） */
  subscribe<E extends DomainEvent>(
    eventType: string,
    handler: (event: E) => Promise<void>
  ): void;
}
```

### 事件信封規格（Event Envelope）

```typescript
interface DomainEvent {
  readonly eventId: string;      // UUID（用於去重）
  readonly eventType: string;    // e.g. 'TaskCompleted'
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: string;   // ISO8601
  readonly payload: Record<string, unknown>;
  readonly metadata: {
    actorId: string;
    workspaceId?: string;
    orgId?: string;
    correlationId: string;       // 關聯 Saga 追蹤
    causationId?: string;        // 引發此事件的前一個事件 ID
  };
}
```

### DLQ（Dead Letter Queue）規則

| 情境 | 處理方式 |
|-----|---------|
| Handler 拋出可恢復錯誤 | 指數退避重試 3 次（1s / 4s / 9s） |
| 3 次重試後仍失敗 | 寫入 DLQ；發出 `alert.dlq_message` 系統告警 |
| DLQ 訊息無效（schema 不符）| 直接丟棄並記錄 `warn` 日誌 |
| 幂等事件重複送達 | 使用 `eventId` 去重；Handler 冪等必須保證 |

---

## 四、IdempotencyStore 規格（SB52）

### 介面

```typescript
interface IdempotencyStore {
  /**
   * 嘗試取得現有結果或加鎖
   * @returns null 代表鎖成功（尚無快取）；non-null 代表已有快取結果
   */
  checkAndLock(key: string, ttlSeconds?: number): Promise<unknown | null>;

  /** 儲存最終結果（成功後呼叫） */
  setResult(key: string, result: unknown, ttlSeconds?: number): Promise<void>;

  /** 解除鎖定（異常時呼叫） */
  releaseLock(key: string): Promise<void>;
}
```

### Redis 實作要點

```
key 格式：    idempotency:{commandType}:{idempotencyKey}
lock TTL：   30 秒（防止死鎖）
result TTL： 24 小時（客戶端可在此期間重送）

Lock 用 SET NX EX 原子指令
Result 用 SET XX PX（只覆蓋已存在的鎖）
```

---

## 五、OptimisticLock 規格（SB53）

### DB 層實作

```sql
-- save() 時的更新語句
UPDATE resource_items
SET    status = :status,
       extension_fields = :fields,
       version = version + 1,
       updated_at = NOW()
WHERE  id = :id
  AND  version = :expectedVersion;   -- 樂觀鎖條件

-- 影響行數 = 0 → 拋出 OptimisticLockException
```

### 例外層級

```typescript
class OptimisticLockException extends Error {
  readonly httpStatus = 409;
  readonly code = 'OPTIMISTIC_LOCK_CONFLICT';
  constructor(aggregateId: string, expected: number, actual: number) {
    super(`Optimistic lock conflict on ${aggregateId}: expected v${expected}, found v${actual}`);
  }
}
```

**客戶端重試策略**：收到 HTTP 409 後，重新 GET 最新版本，再次提交 Command（帶最新 version）。

---

## 六、StorageAdapter 規格（PostMedia 上傳）

```typescript
interface StorageAdapter {
  /**
   * 上傳媒體檔案
   * @returns 永久可存取 URL（CDN 路徑）
   */
  upload(file: Buffer, contentType: string, path: string): Promise<string>;

  /** 刪除媒體（post_media cascade 刪除時呼叫）*/
  delete(url: string): Promise<void>;

  /**
   * 產生短期預簽名 URL（前端直接上傳，不透過 API Server）
   * TTL: 15 分鐘
   */
  presignUploadUrl(path: string, contentType: string): Promise<string>;
}
```

### 安全注意事項

- 禁止 client 直接存取儲存 bucket URL；一律透過 CDN 或 presigned URL。
- `path` 格式：`{orgId}/{workspaceId}/post_media/{uuid}.{ext}`，防止路徑遍歷。
- MIME type 白名單：`image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `application/pdf`。

---

## 七、ExternalAdapter 規格

### NotificationGateway

```typescript
interface NotificationGateway {
  /** 發送推播（FCM / APNs） */
  sendPush(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
  /** 發送 Email（Transactional） */
  sendEmail(to: string, templateId: string, variables: Record<string, string>): Promise<void>;
}
```

### AiServiceAdapter（技能門檻建議）

```typescript
interface AiServiceAdapter {
  /**
   * 建議 task 的技能需求與門檻等級
   * 在 CreateTaskItemCommand 後非同步呼叫（不阻塞主流程）
   */
  suggestSkillRequirements(taskDescription: string, orgId: string): Promise<SkillSuggestion[]>;
}
```

> **邊界規則**：AiServiceAdapter 是純外部呼叫，不寫入 Domain 狀態；結果作為建議顯示給用戶，用戶需明確執行 Command 才會生效。

---

## 八、基礎設施層依賴方向

```
L8 Application Service / Saga
  │
  │  ← 依賴介面（Repository, EventBus, Guard, StorageAdapter）
  │
L9 Infrastructure
  ├── PostgresTaskItemRepository implements TaskItemRepository
  ├── PostgresPostRepository implements PostRepository
  ├── PostgresUserSkillRepository implements UserSkillRepository
  ├── PostgresFeedProjectionRepository implements FeedProjectionRepository
  ├── KafkaEventBus implements EventBus
  ├── RedisIdempotencyStore implements IdempotencyStore
  ├── S3StorageAdapter implements StorageAdapter
  ├── FCMNotificationGateway implements NotificationGateway
  └── OpenAIAiServiceAdapter implements AiServiceAdapter
```

> L8 只知道介面；L9 只知道實作細節。這是 Hexagonal Architecture（Ports & Adapters）的核心原則。
