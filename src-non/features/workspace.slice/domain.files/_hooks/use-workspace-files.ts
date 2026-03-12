"use client";

import { useEffect, useMemo, useState } from 'react';

import { useWorkspace } from '@/features/workspace.slice/core';

import { subscribeToWorkspaceFiles } from '../_queries';
import type { WorkspaceFile } from '../_types';
import {
  getStructuredRelationKey,
  isStructuredSidecarFile,
  type WorkspaceFileWithRelations,
} from '../_components/files-view.utils';

export function useWorkspaceFilesQuery() {
  const { workspace } = useWorkspace();
  const [files, setFiles] = useState<WorkspaceFile[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToWorkspaceFiles(workspace.id, setFiles);
    return () => unsubscribe();
  }, [workspace.id]);

  const displayFiles = useMemo<WorkspaceFileWithRelations[]>(() => {
    const sidecarByKey = new Map<string, WorkspaceFile>();
    const usedSidecars = new Set<string>();

    for (const file of files) {
      if (!isStructuredSidecarFile(file.name)) continue;
      const key = getStructuredRelationKey(file.name);
      if (!sidecarByKey.has(key)) {
        sidecarByKey.set(key, file);
      }
    }

    const primaryFiles: WorkspaceFileWithRelations[] = [];
    for (const file of files) {
      if (isStructuredSidecarFile(file.name)) continue;
      const key = getStructuredRelationKey(file.name);
      const relatedStructuredFile = sidecarByKey.get(key);
      if (relatedStructuredFile) {
        usedSidecars.add(relatedStructuredFile.id);
      }
      primaryFiles.push({
        ...file,
        ...(relatedStructuredFile ? { relatedStructuredFile } : {}),
      });
    }

    const orphanSidecars = files.filter(
      (file) => isStructuredSidecarFile(file.name) && !usedSidecars.has(file.id),
    ) as WorkspaceFileWithRelations[];

    return [...primaryFiles, ...orphanSidecars];
  }, [files]);

  return { files, displayFiles };
}
