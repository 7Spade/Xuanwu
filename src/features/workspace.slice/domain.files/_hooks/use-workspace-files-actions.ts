/**
 * Module: use-workspace-files-actions.ts
 * Purpose: Provide file lifecycle actions and parser navigation handoff.
 * Responsibilities: upload/version operations, parser intent dispatch.
 * Constraints: deterministic logic, respect module boundaries
 */

"use client";

import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/app-runtime/providers/auth-provider';
import { useI18n } from '@/app-runtime/providers/i18n-provider';
import { useWorkspace } from '@/features/workspace.slice/core';
import { toast } from '@/shadcn-ui/hooks/use-toast';

import {
  addWorkspaceFileVersion,
  createWorkspaceFile,
  deleteVersionStorageObjects,
  deregisterWorkspaceFile,
  restoreWorkspaceFileVersion,
  uploadRawFile,
} from '../_actions';
import type { WorkspaceFile, WorkspaceFileVersion } from '../_types';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

interface UseWorkspaceFilesActionsArgs {
  readonly files: readonly WorkspaceFile[];
  readonly onRestoreSuccess?: () => void;
}

export function useWorkspaceFilesActions({
  files,
  onRestoreSuccess,
}: UseWorkspaceFilesActionsArgs) {
  const { t } = useI18n();
  const { workspace, logAuditEvent, setPendingParseFile } = useWorkspace();
  const { state: { user } } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      const existingFile = files.find((currentFile) => currentFile.name === file.name);

      if (existingFile) {
        const nextVer = (existingFile.versions?.length || 0) + 1;
        const versionId = Math.random().toString(36).slice(-6);
        const uploadResult = await uploadRawFile(workspace.id, existingFile.id, versionId, file);

        const newVersion: WorkspaceFileVersion = {
          versionId,
          versionNumber: nextVer,
          versionName: `Revision #${nextVer}`,
          size: file.size,
          uploadedBy: user.name,
          createdAt: new Date(),
          downloadURL: uploadResult.downloadURL,
          storagePath: uploadResult.storagePath,
        };

        const result = await addWorkspaceFileVersion(workspace.id, existingFile.id, newVersion, versionId);
        if (!result.success) {
          toast({ variant: 'destructive', title: t('workspaces.failedToUploadFile'), description: result.error.message });
          return;
        }

        logAuditEvent('File Version Iterated', `${file.name} (v${nextVer})`, 'update');
        toast({ title: t('workspaces.versionIterated'), description: t('workspaces.versionIteratedDescription', { name: file.name, version: nextVer }) });
        return;
      }

      const fileId = Math.random().toString(36).slice(2, 11);
      const versionId = Math.random().toString(36).slice(-6);
      const uploadResult = await uploadRawFile(workspace.id, fileId, versionId, file);

      const newFileData: Omit<WorkspaceFile, 'id' | 'updatedAt'> = {
        name: file.name,
        type: file.type,
        currentVersionId: versionId,
        versions: [{
          versionId,
          versionNumber: 1,
          versionName: 'Initial Specification',
          size: file.size,
          uploadedBy: user.name,
          createdAt: new Date(),
          downloadURL: uploadResult.downloadURL,
          storagePath: uploadResult.storagePath,
        }],
      };

      const result = await createWorkspaceFile(workspace.id, newFileData);
      if (!result.success) {
        toast({ variant: 'destructive', title: t('workspaces.failedToUploadFile'), description: result.error.message });
        return;
      }

      logAuditEvent('Mounted New Document', file.name, 'create');
      toast({ title: t('workspaces.documentUploaded'), description: t('workspaces.documentUploadedDescription', { name: file.name }) });
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      toast({
        variant: 'destructive',
        title: t('workspaces.failedToUploadFile'),
        description: getErrorMessage(error, 'An unknown error occurred.'),
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [files, logAuditEvent, t, user, workspace.id]);

  const handleRestore = useCallback(async (file: WorkspaceFile, versionId: string) => {
    const result = await restoreWorkspaceFileVersion(workspace.id, file.id, versionId);
    if (!result.success) {
      console.error('Error restoring version:', result.error.message);
      toast({
        variant: 'destructive',
        title: t('workspaces.failedToRestoreVersion'),
        description: result.error.message,
      });
      return;
    }

    logAuditEvent('Restored File State', `${file.name} to a previous version`, 'update');
    toast({ title: t('workspaces.versionRestored'), description: t('workspaces.versionRestoredDescription') });
    onRestoreSuccess?.();
  }, [logAuditEvent, onRestoreSuccess, t, workspace.id]);

  const handleDeregister = useCallback(async (file: WorkspaceFile) => {
    const storagePaths = (file.versions ?? [])
      .map((version) => version.storagePath)
      .filter((path): path is string => typeof path === 'string' && path.length > 0);

    await deleteVersionStorageObjects(storagePaths);

    const result = await deregisterWorkspaceFile(workspace.id, file.id);
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: t('workspaces.failedToDeregisterFile'),
        description: result.error.message,
      });
      return;
    }

    await logAuditEvent('Deregistered File', file.name, 'delete');
    toast({
      title: t('workspaces.fileDeregistered'),
      description: t('workspaces.fileDeregisteredDescription', { name: file.name }),
    });
  }, [logAuditEvent, t, workspace.id]);

  const handleDownloadVersion = useCallback((version?: WorkspaceFileVersion) => {
    if (!version?.downloadURL) return;
    globalThis.open(version.downloadURL, '_blank');
  }, []);

  const handleParseWithAi = useCallback((
    file: WorkspaceFile,
    version: WorkspaceFileVersion | undefined,
    context: {
      parseMode: 'document-ai' | 'genkit-ai';
      sourceType: 'original' | 'structured-sidecar';
      triggeredFrom: 'files-table-row' | 'files-expanded-panel';
    },
  ) => {
    if (!version?.downloadURL) return;

    const isStructuredSidecar = file.name.toLowerCase().endsWith('.document-ai.json');
    const isInvalidDocumentAiInput = context.parseMode === 'document-ai' && context.sourceType !== 'original';
    const isInvalidGenkitInput =
      context.parseMode === 'genkit-ai'
      && (context.sourceType !== 'structured-sidecar' || !isStructuredSidecar);

    if (isInvalidDocumentAiInput || isInvalidGenkitInput) {
      return;
    }

    setPendingParseFile({
      fileName: file.name,
      fileType: file.type,
      parseMode: context.parseMode,
      sourceType: context.sourceType,
      triggeredFrom: context.triggeredFrom,
      fileId: file.id,
      versionId: version.versionId,
      storagePath: version.storagePath,
      downloadURL: version.downloadURL,
    });
    logAuditEvent('Sent File to Parser', `${file.name} (${context.parseMode})`, 'update');
    toast({
      title: t('workspaces.sentToParser'),
      description: t('workspaces.sentToParserDescription', {
        name: file.name,
        mode: context.parseMode,
      }),
    });
  }, [logAuditEvent, setPendingParseFile, t]);

  return {
    fileInputRef,
    isUploading,
    handleUploadClick,
    handleFileSelect,
    handleRestore,
    handleDeregister,
    handleDownloadVersion,
    handleParseWithAi,
  };
}
