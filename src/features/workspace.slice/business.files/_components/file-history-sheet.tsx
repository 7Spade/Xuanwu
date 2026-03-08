"use client";

import {
  CheckCircle2,
  Download,
  History,
  ListChecks,
  Sparkles,
  RotateCcw,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/app-runtime/providers/i18n-provider';
import { Badge } from '@/shadcn-ui/badge';
import { Button } from '@/shadcn-ui/button';
import { ScrollArea } from '@/shadcn-ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shadcn-ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shadcn-ui/tabs';
import { cn } from '@/shadcn-ui/utils/utils';

import type { WorkspaceFile, WorkspaceFileVersion } from '../_types';

import {
  formatBytes,
  formatVersionDate,
  getCurrentVersion,
  getProcessingLogEntries,
  getRelatedStructuredFile,
  getStructuredDataSnapshot,
  type WorkspaceFileWithRelations,
} from './files-view.utils';

export type HistoryPanelTab = 'versions' | 'structured' | 'processing';

interface FileHistorySheetProps {
  readonly historyFile: WorkspaceFileWithRelations | null;
  readonly defaultTab?: HistoryPanelTab;
  readonly onClose: () => void;
  readonly onRestore: (file: WorkspaceFile, versionId: string) => void;
  readonly onDownloadVersion: (version?: WorkspaceFileVersion) => void;
  readonly onReparse: (file: WorkspaceFile, version?: WorkspaceFileVersion) => void;
}

export function FileHistorySheet({
  historyFile,
  defaultTab = 'versions',
  onClose,
  onRestore,
  onDownloadVersion,
  onReparse,
}: FileHistorySheetProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<HistoryPanelTab>(defaultTab);

  useEffect(() => {
    if (!historyFile) return;
    setActiveTab(defaultTab);
  }, [defaultTab, historyFile]);

  const currentVersion = useMemo(
    () => (historyFile ? getCurrentVersion(historyFile) : undefined),
    [historyFile],
  );
  const structuredSnapshot = useMemo(
    () => (historyFile ? getStructuredDataSnapshot(historyFile, currentVersion) : null),
    [currentVersion, historyFile],
  );
  const processingLogs = useMemo(
    () => (historyFile ? getProcessingLogEntries(historyFile, currentVersion, 'en-US') : []),
    [currentVersion, historyFile],
  );
  const relatedStructuredFile = useMemo(
    () => (historyFile ? getRelatedStructuredFile(historyFile) : undefined),
    [historyFile],
  );
  const relatedStructuredVersion = useMemo(
    () => (relatedStructuredFile ? getCurrentVersion(relatedStructuredFile) : undefined),
    [relatedStructuredFile],
  );

  return (
    <Sheet open={Boolean(historyFile)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col border-l-border/40 p-0 sm:max-w-md">
        <div className="border-b bg-primary/5 p-8">
          <SheetHeader>
            <div className="mb-2 flex items-center gap-3">
              <History className="size-5 text-primary" />
              <SheetTitle className="text-xl font-black">{t('workspaces.versionHistory')}</SheetTitle>
            </div>
            <SheetDescription className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">
              {t('workspaces.file')}: {historyFile?.name}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HistoryPanelTab)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 text-[10px] font-bold uppercase">
              <TabsTrigger value="versions">{t('workspaces.versionHistory')}</TabsTrigger>
              <TabsTrigger value="structured">{t('workspaces.structuredData')}</TabsTrigger>
              <TabsTrigger value="processing">{t('workspaces.aiProcessingLog')}</TabsTrigger>
            </TabsList>

            <TabsContent value="versions" className="mt-0">
              <div className="relative space-y-8 pl-8 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-primary/20">
                {historyFile?.versions?.slice().reverse().map((version) => (
                  <div key={version.versionId} className="relative">
                    <div
                      className={cn(
                        'absolute -left-10 top-1 h-5 w-5 rounded-full border-4 border-background ring-2 transition-all',
                        historyFile.currentVersionId === version.versionId
                          ? 'scale-125 bg-primary ring-primary/20 shadow-lg shadow-primary/30'
                          : 'bg-muted ring-muted/20',
                      )}
                    />
                    <div
                      className={cn(
                        'rounded-2xl border p-5 transition-all',
                        historyFile.currentVersionId === version.versionId
                          ? 'border-primary/30 bg-primary/5 shadow-sm'
                          : 'border-border/60 bg-muted/30',
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-black">
                          V{version.versionNumber} ({formatVersionDate(version.createdAt, 'en-US')})
                        </p>
                        {historyFile.currentVersionId === version.versionId && (
                          <Badge className="gap-1 bg-primary text-[8px] font-black uppercase">
                            <CheckCircle2 className="size-2.5" /> {t('workspaces.active')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-2.5" /> {version.uploadedBy}
                        </span>
                        <span>{formatBytes(version.size)}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/10 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[9px] font-bold"
                          onClick={() => onDownloadVersion(version)}
                          disabled={!version.downloadURL}
                        >
                          <Download className="mr-1 size-3" /> {t('workspaces.viewOriginalFile')}
                        </Button>
                        {historyFile.currentVersionId !== version.versionId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 bg-background text-[9px] font-black uppercase transition-all hover:bg-primary hover:text-white"
                            onClick={() => onRestore(historyFile, version.versionId)}
                          >
                            <RotateCcw className="mr-2 size-3" /> {t('workspaces.restore')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="structured" className="mt-0">
              <div className="space-y-4 rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
                  <ListChecks className="size-4 text-primary" /> {t('workspaces.structuredDataStatus')}
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase">
                  {t('workspaces.enabled')}
                </Badge>
                <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-[10px] leading-relaxed">
                  {JSON.stringify(structuredSnapshot?.full ?? {}, null, 2)}
                </pre>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-bold"
                    onClick={() => {
                      if (relatedStructuredVersion?.downloadURL) {
                        onDownloadVersion(relatedStructuredVersion);
                        return;
                      }
                      if (!structuredSnapshot) return;
                      const json = JSON.stringify(structuredSnapshot.full, null, 2);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = globalThis.URL.createObjectURL(blob);
                      globalThis.open(url, '_blank');
                      globalThis.setTimeout(() => globalThis.URL.revokeObjectURL(url), 1000);
                    }}
                  >
                    {t('workspaces.downloadStructuredData')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-[10px] font-bold"
                    onClick={() => historyFile && onReparse(historyFile, currentVersion)}
                  >
                    {t('workspaces.reparse')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="processing" className="mt-0">
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                {processingLogs.map((entry, index) => (
                  <div key={`${entry.actor}-${entry.at}-${index}`} className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold">
                      <Sparkles className="size-3.5 text-primary" />
                      {t('workspaces.aiProcessingBy', { actor: entry.actor, time: entry.at })}
                    </p>
                  </div>
                ))}
                {processingLogs.length === 0 && (
                  <p className="text-xs text-muted-foreground">{t('workspaces.noAiProcessingLogs')}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
