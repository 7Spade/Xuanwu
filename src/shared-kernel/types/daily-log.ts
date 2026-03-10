/**
 * Module: daily-log.ts
 * Purpose: Centralized daily log domain type definitions.
 * Responsibilities: DailyLog entity and comment types for the施工日誌 (A-track daily log).
 * Constraints: deterministic logic, respect module boundaries
 */

import type { Timestamp } from '@/shared-kernel/ports';

export interface DailyLogComment {
  id: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: Timestamp;
}

export interface DailyLog {
  id: string;
  accountId: string;
  workspaceId: string;
  workspaceName: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  photoURLs: string[];
  recordedAt: Timestamp;
  createdAt: Timestamp;
  likes?: string[];
  likeCount?: number;
  commentCount?: number;
  comments?: DailyLogComment[];
}
