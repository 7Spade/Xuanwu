/**
 * shared.kernel/infrastructure-ports — SK_PORTS [D24]
 */

export type {
  IAuthService,
  AuthUser,
} from '@/shared/ports';

export type {
  IFirestoreRepo,
  FirestoreDoc,
  Timestamp,
  WriteOptions,
} from '@/shared/ports';

export type {
  IMessaging,
  PushNotificationPayload,
} from '@/shared/ports';

export type {
  IFileStore,
  UploadOptions,
} from '@/shared/ports';
