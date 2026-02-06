"use client";

import { useAppStore } from "@/lib/store";
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCallback } from "react";

/**
 * useLogger - 職責：零認知日誌接口
 * 自動處理 Daily 與 Pulse 的物理分離存放。
 */
export function useLogger(workspaceId?: string, workspaceName?: string) {
  const { db } = useFirebase();
  const { user, activeOrgId } = useAppStore();

  const logDaily = useCallback(async (content: string) => {
    if (!activeOrgId || !user || !db) return;

    const dailyData = {
      content,
      author: user.name,
      timestamp: serverTimestamp(),
      orgId: activeOrgId,
      workspaceId: workspaceId || null,
      workspaceName: workspaceName || "維度層級"
    };

    return addDoc(collection(db, "organizations", activeOrgId, "dailyLogs"), dailyData);
  }, [db, user, activeOrgId, workspaceId, workspaceName]);

  const logEvent = useCallback(async (action: string, target: string) => {
    if (!activeOrgId || !user || !db) return;

    const eventData = {
      actor: user.name,
      action,
      target,
      timestamp: serverTimestamp(),
      orgId: activeOrgId,
      workspaceId: workspaceId || null
    };

    return addDoc(collection(db, "organizations", activeOrgId, "pulseLogs"), eventData);
  }, [db, user, activeOrgId, workspaceId]);

  return { logDaily, logEvent };
}
