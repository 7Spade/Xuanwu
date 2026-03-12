/**
 * Module: pending-parse-storage.ts
 * Purpose: Persist pending parser handoff payloads across route changes.
 * Responsibilities: save/load/clear workspace-scoped pending parse payload.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { FileSendToParserPayload } from '@/features/workspace.slice/core.event-bus';

const PENDING_PARSE_STORAGE_PREFIX = 'workspace:pending-parse-file:';

function getPendingParseStorageKey(workspaceId: string): string {
  return `${PENDING_PARSE_STORAGE_PREFIX}${workspaceId}`;
}

export function savePendingParseFile(
  workspaceId: string,
  payload: FileSendToParserPayload,
): void {
  if (typeof globalThis.localStorage === 'undefined') {
    return;
  }
  globalThis.localStorage.setItem(getPendingParseStorageKey(workspaceId), JSON.stringify(payload));
}

export function loadPendingParseFile(workspaceId: string): FileSendToParserPayload | null {
  if (typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  const raw = globalThis.localStorage.getItem(getPendingParseStorageKey(workspaceId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FileSendToParserPayload>;
    if (typeof parsed.fileName !== 'string' || typeof parsed.downloadURL !== 'string') {
      return null;
    }
    return parsed as FileSendToParserPayload;
  } catch {
    return null;
  }
}

export function clearPendingParseFile(workspaceId: string): void {
  if (typeof globalThis.localStorage === 'undefined') {
    return;
  }
  globalThis.localStorage.removeItem(getPendingParseStorageKey(workspaceId));
}
