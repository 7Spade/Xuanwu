// [職責] Projection — Account 層跨 Workspace 稽核事件流 (全維度、唯讀)
"use client";

import { AlertCircle, Terminal } from "lucide-react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { useAccountAudit } from "../_hooks/use-account-audit";

import { AuditDetailSheet } from "./audit-detail-sheet";
import { AuditEventItem } from "./audit-event-item";
import { AuditTimeline } from "./audit-timeline";


export function AccountAuditComponent() {
  const { t } = useI18n();
  const { logs, isOrganizationContext, selectedLog, setSelectedLog, clearSelection } = useAccountAudit();

  if (!isOrganizationContext) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <h3 className="font-bold">{t('workspace.auditLogNotAvailable')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('workspace.auditLogNotAvailableDescription')}
        </p>
      </div>
    );
  }

  return (
    <>
      {logs.length > 0 ? (
        <AuditTimeline>
          {logs.map((log) => (
            <AuditEventItem key={log.id} log={log} onSelect={() => setSelectedLog(log)} />
          ))}
        </AuditTimeline>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 p-32 text-center opacity-30">
          <Terminal className="size-12" />
          <p className="text-sm font-black uppercase tracking-widest">{t('workspace.noSpecChangesRecorded')}</p>
        </div>
      )}

      <AuditDetailSheet
        log={selectedLog}
        isOpen={!!selectedLog}
        onOpenChange={(open) => { if (!open) clearSelection(); }}
      />
    </>
  );
}
