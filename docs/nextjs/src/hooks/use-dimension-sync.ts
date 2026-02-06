"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { useFirebase } from "@/firebase/provider";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/**
 * useDimensionSync - 職責：全域數據同步中心
 * 透過 authInitialized 守衛解決刷新登出，並同步 Daily 與 Pulse 兩大獨立集合。
 */
export function useDimensionSync() {
  const { user, login, setOrganizations, setWorkspaces, setDailyLogs, setPulseLogs, activeOrgId, setAuthInitialized } = useAppStore();
  const { db, auth } = useFirebase();

  // 1. 身分共振監聽器
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        login({ id: firebaseUser.uid, name: firebaseUser.displayName || '維度成員', email: firebaseUser.email || '' });
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, [auth, login, setAuthInitialized]);

  // 2. 維度與空間同步
  useEffect(() => {
    if (!user || !db) return;
    
    const orgsUnsubscribe = onSnapshot(
      query(collection(db, "organizations"), where("members", "array-contains-any", [{ id: user.id, name: user.name, email: user.email, role: 'Owner', status: 'active' }])),
      (snap) => setOrganizations(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any)
    );

    const wsUnsubscribe = onSnapshot(
      collection(db, "workspaces"),
      (snap) => setWorkspaces(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any)
    );

    return () => {
      orgsUnsubscribe();
      wsUnsubscribe();
    };
  }, [user, db, setOrganizations, setWorkspaces]);

  // 3. DailyLogs 與 PulseLogs 同步 (基於 ActiveOrg)
  useEffect(() => {
    if (!db || !activeOrgId) return;

    const dailyUnsubscribe = onSnapshot(
      query(collection(db, "organizations", activeOrgId, "dailyLogs"), orderBy("timestamp", "desc"), limit(50)),
      (snap) => setDailyLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any)
    );

    const pulseUnsubscribe = onSnapshot(
      query(collection(db, "organizations", activeOrgId, "pulseLogs"), orderBy("timestamp", "desc"), limit(50)),
      (snap) => setPulseLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any)
    );

    return () => {
      dailyUnsubscribe();
      pulseUnsubscribe();
    };
  }, [db, activeOrgId, setDailyLogs, setPulseLogs]);
}
