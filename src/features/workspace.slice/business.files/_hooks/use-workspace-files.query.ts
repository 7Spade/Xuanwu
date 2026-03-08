"use client";

import { useEffect, useState } from 'react';

import { useWorkspace } from '@/features/workspace.slice/core';

import { subscribeToWorkspaceFiles } from '../_queries';
import type { WorkspaceFile } from '../_types';

export function useWorkspaceFilesQuery() {
  const { workspace } = useWorkspace();
  const [files, setFiles] = useState<WorkspaceFile[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToWorkspaceFiles(workspace.id, setFiles);
    return () => unsubscribe();
  }, [workspace.id]);

  return { files };
}
