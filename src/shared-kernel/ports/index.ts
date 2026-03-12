/**
 * Module: index.ts
 * Purpose: provide flattened SK_PORTS public exports
 * Responsibilities: aggregate canonical infrastructure port interfaces
 * Constraints: deterministic logic, respect module boundaries
 */

export type { IAuthService, AuthUser } from './i-auth.service';
export type {
  IFirestoreRepo,
  FirestoreDoc,
  Timestamp,
  WriteOptions,
} from './i-firestore.repo';
export type { IMessaging, PushNotificationPayload } from './i-messaging';
export type { IFileStore, UploadOptions } from './i-file-store';
export type { EventBus } from './i-event-bus';
export type { IdempotencyStore } from './i-idempotency-store';
export type { AggregateRoot } from './i-aggregate-root';
export type { NotificationGateway } from './i-notification-gateway';
export type { AiServiceAdapter, SkillSuggestion } from './i-ai-service-adapter';
export type { AggregateRepository, QueryOptions } from './i-aggregate-repository';
export type { TaskItemRepository } from './i-task-item-repository';
export type { UserSkillRepository, UserSkill, SkillMintLog } from './i-user-skill-repository';
export type { FeedProjectionRepository, FeedProjection } from './i-feed-projection-repository';

