import type { WorkspaceFile, WorkspaceFileVersion } from '../_types';

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getCurrentVersion = (file: WorkspaceFile): WorkspaceFileVersion | undefined =>
  file.versions?.find((version) => version.versionId === file.currentVersionId) ?? file.versions?.[0];
