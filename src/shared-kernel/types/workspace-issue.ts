/**
 * Module: workspace-issue.ts
 * Purpose: Centralized workspace issue domain type definitions.
 * Responsibilities: WorkspaceIssue entity and related comment types.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { Timestamp } from '@/shared-kernel/ports';

export interface IssueComment {
  id: string;
  author: string;
  content: string;
  createdAt: Timestamp;
}

export interface WorkspaceIssue {
  id: string;
  title: string;
  type: 'technical' | 'financial';
  priority: 'high' | 'medium';
  issueState: 'open' | 'closed';
  /** SourcePointer to the A-track task that triggered this B-track issue. */
  sourceTaskId?: string;
  createdAt: Timestamp;
  comments?: IssueComment[];
}
