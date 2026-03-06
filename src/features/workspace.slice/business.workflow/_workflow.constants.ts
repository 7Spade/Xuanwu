export const WorkflowStatusValues = [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type WorkflowStatus = (typeof WorkflowStatusValues)[number];

export const WorkflowErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type WorkflowErrorCode = (typeof WorkflowErrorCodes)[keyof typeof WorkflowErrorCodes];
