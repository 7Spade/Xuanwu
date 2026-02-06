"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { Workspace, PulseLog } from '@/types/domain';
import { useAppStore } from '@/lib/store';
import { useLogger } from '@/hooks/use-logger';

interface WorkspaceContextType {
  workspace: Workspace;
  localPulse: PulseLog[];
  emitEvent: (action: string, detail: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ workspaceId, children }: { workspaceId: string, children: React.ReactNode }) {
  const { workspaces, pulseLogs } = useAppStore();
  const workspace = useMemo(() => workspaces.find(w => w.id === workspaceId), [workspaces, workspaceId]);
  
  // 零認知日誌接口
  const { logEvent } = useLogger(workspaceId, workspace?.name);

  const localPulse = useMemo(() => 
    pulseLogs.filter(log => log.workspaceId === workspaceId),
    [pulseLogs, workspaceId]
  );

  const value = useMemo(() => {
    if (!workspace) return null;
    return {
      workspace,
      localPulse,
      emitEvent: (action: string, detail: string) => logEvent(action, detail)
    };
  }, [workspace, localPulse, logEvent]);

  if (!value) return null;

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
}
