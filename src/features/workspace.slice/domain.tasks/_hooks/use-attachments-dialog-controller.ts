/**
 * Module: use-attachments-dialog-controller.ts
 * Purpose: isolate attachments dialog state and save workflow for WBS Governance
 * Responsibilities: open/close dialog, manage selected files, persist uploaded attachments
 * Constraints: deterministic logic, respect module boundaries
 */

'use client';

import { useState } from 'react';

import { toast } from '@/shadcn-ui/hooks/use-toast';

import { type TaskWithChildren, type WorkspaceTask } from '../_types';

type UpdateTask = (taskId: string, updates: Partial<WorkspaceTask>) => Promise<void>;
type UploadTaskAttachment = (file: File) => Promise<string>;
type LogAuditEvent = (action: string, target: string, operation: 'create' | 'update' | 'delete') => void;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useAttachmentsDialogController(params: {
  updateTask: UpdateTask;
  uploadTaskAttachment: UploadTaskAttachment;
  logAuditEvent: LogAuditEvent;
}) {
  const { updateTask, uploadTaskAttachment, logAuditEvent } = params;

  const [attachmentsTask, setAttachmentsTask] = useState<TaskWithChildren | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isAttachmentsSaving, setIsAttachmentsSaving] = useState(false);

  const openAttachments = (task: TaskWithChildren) => {
    setAttachmentsTask(task);
    setAttachmentFiles([]);
  };

  const closeAttachments = () => {
    setAttachmentsTask(null);
    setAttachmentFiles([]);
  };

  const selectFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachmentFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const saveAttachments = async () => {
    if (!attachmentsTask || attachmentFiles.length === 0) {
      if (attachmentsTask) closeAttachments();
      return;
    }

    setIsAttachmentsSaving(true);

    try {
      const uploaded = await Promise.all(attachmentFiles.map((file) => uploadTaskAttachment(file)));
      const merged = [...(attachmentsTask.photoURLs ?? []), ...uploaded];

      await updateTask(attachmentsTask.id, { photoURLs: merged });
      logAuditEvent('Updated Task Attachments', attachmentsTask.name, 'update');
      closeAttachments();
      toast({ title: 'Attachments Updated' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Attachments',
        description: getErrorMessage(error, 'An unknown error occurred.'),
      });
    } finally {
      setIsAttachmentsSaving(false);
    }
  };

  return {
    attachmentsTask,
    attachmentFiles,
    isAttachmentsSaving,
    openAttachments,
    closeAttachments,
    selectFiles,
    removeFile,
    saveAttachments,
  };
}
