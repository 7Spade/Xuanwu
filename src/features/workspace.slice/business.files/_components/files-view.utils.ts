import type { WorkspaceFile, WorkspaceFileVersion } from '../_types';

interface TimestampLike {
  toDate?: () => Date;
}

interface JsonRecord {
  [key: string]: unknown;
}

export interface StructuredDataSnapshot {
  readonly summary: JsonRecord;
  readonly full: JsonRecord;
}

export interface FileProcessingLogEntry {
  readonly actor: string;
  readonly at: string;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getCurrentVersion = (file: WorkspaceFile): WorkspaceFileVersion | undefined =>
  file.versions?.find((version) => version.versionId === file.currentVersionId) ?? file.versions?.[0];

export const parseDateFromUnknown = (value: unknown): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'object' && value !== null) {
    const maybeTimestamp = value as TimestampLike;
    if (typeof maybeTimestamp.toDate === 'function') {
      const parsed = maybeTimestamp.toDate();
      return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
    }
  }
  return null;
};

export const formatVersionDate = (value: unknown, locale: string): string => {
  const parsedDate = parseDateFromUnknown(value);
  if (!parsedDate) return '--';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate);
};

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const pickFirstObject = (candidates: unknown[]): JsonRecord | null => {
  for (const candidate of candidates) {
    if (isJsonRecord(candidate)) return candidate;
  }
  return null;
};

export const getStructuredDataSnapshot = (
  file: WorkspaceFile,
  version?: WorkspaceFileVersion,
): StructuredDataSnapshot => {
  const targetVersion = version ?? getCurrentVersion(file);
  const source = targetVersion as unknown as JsonRecord;

  const extracted = pickFirstObject([
    source?.structuredData,
    source?.structuredSummary,
    source?.parsedData,
    source?.parsedJson,
    source?.json,
    source?.metadata,
  ]);

  const fallback: JsonRecord = {
    fileName: file.name,
    fileType: file.type,
    versionId: targetVersion?.versionId ?? null,
    versionNumber: targetVersion?.versionNumber ?? null,
    uploadedBy: targetVersion?.uploadedBy ?? null,
    sizeBytes: targetVersion?.size ?? 0,
    storagePath: targetVersion?.storagePath ?? null,
  };

  const full = extracted ?? fallback;
  const summaryKeys = Object.keys(full).slice(0, 4);
  const summary = summaryKeys.reduce<JsonRecord>((acc, key) => {
    acc[key] = full[key];
    return acc;
  }, {});

  return {
    summary,
    full,
  };
};

export const getProcessingLogEntries = (
  file: WorkspaceFile,
  version?: WorkspaceFileVersion,
  locale: string = 'en-US',
): FileProcessingLogEntry[] => {
  const targetVersion = version ?? getCurrentVersion(file);
  if (!targetVersion) return [];

  const source = targetVersion as unknown as JsonRecord;
  const actor = typeof source?.processedBy === 'string'
    ? source.processedBy
    : typeof source?.processor === 'string'
      ? source.processor
      : 'Document-AI-Function';

  const parsedAt = parseDateFromUnknown(source?.processedAt)
    ?? parseDateFromUnknown(source?.parsedAt)
    ?? parseDateFromUnknown(targetVersion.createdAt)
    ?? new Date();

  const at = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsedAt);

  return [{ actor, at }];
};
