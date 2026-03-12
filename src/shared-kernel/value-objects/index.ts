/**
 * shared-kernel/value-objects/index.ts
 *
 * Public exports for all VS0 shared-kernel value objects.
 *
 * Layer: VS0 Shared Kernel — Domain (pure, no I/O)
 * Per docs/architecture/README.md: Value Objects must be immutable and self-validating.
 *
 * Add new value objects here as the DDD migration progresses.
 */

export { WorkspaceId } from './workspace-id';
export type { WorkspaceIdError } from './workspace-id';
export { WORKSPACE_ID_ERRORS } from './workspace-id';

export { TaskId } from './task-id';
export type { TaskIdError } from './task-id';
export { TASK_ID_ERRORS } from './task-id';

export { Money } from './money';
export type { CurrencyCode, MoneyError } from './money';
export { MONEY_ERRORS } from './money';
