import type { WorkspaceFile } from '../_types';

export type {
  StructuredDataSnapshot,
  FileProcessingLogEntry,
} from '@/shared-kernel';

export interface WorkspaceFileWithRelations extends WorkspaceFile {
  readonly relatedStructuredFile?: WorkspaceFile;
}

const STRUCTURED_SIDECAR_SUFFIX = '.document-ai.json';

export {
  formatBytes,
  getCurrentVersion,
  parseDateFromUnknown,
  formatVersionDate,
  getStructuredDataSnapshot,
  getProcessingLogEntries,
} from '@/shared-kernel';

export const isStructuredSidecarFile = (fileName: string): boolean =>
  fileName.toLowerCase().endsWith(STRUCTURED_SIDECAR_SUFFIX);

export const getStructuredRelationKey = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase();
  if (isStructuredSidecarFile(normalized)) {
    return normalized.slice(0, -STRUCTURED_SIDECAR_SUFFIX.length);
  }
  const dotIndex = normalized.lastIndexOf('.');
  if (dotIndex <= 0) return normalized;
  return normalized.slice(0, dotIndex);
};

export const getRelatedStructuredFile = (file: WorkspaceFile): WorkspaceFile | undefined =>
  (file as WorkspaceFileWithRelations).relatedStructuredFile;
