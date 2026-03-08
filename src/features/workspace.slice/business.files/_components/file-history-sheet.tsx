import {
  CheckCircle2,
  Download,
  History,
  RotateCcw,
  User,
} from 'lucide-react';

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
import { cn } from '@/shadcn-ui/utils/utils';

import type { WorkspaceFile, WorkspaceFileVersion } from '../_types';

import { formatBytes } from './files-view.utils';

interface FileHistorySheetProps {
  readonly historyFile: WorkspaceFile | null;
  readonly onClose: () => void;
  readonly onRestore: (file: WorkspaceFile, versionId: string) => void;
  readonly onDownloadVersion: (version?: WorkspaceFileVersion) => void;
}

export function FileHistorySheet({
  historyFile,
  onClose,
  onRestore,
  onDownloadVersion,
}: FileHistorySheetProps) {
  const { t } = useI18n();

  return (
    <Sheet open={Boolean(historyFile)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col border-l-border/40 p-0 sm:max-w-md">
        <div className="border-b bg-primary/5 p-8">
          <SheetHeader>
            <div className="mb-2 flex items-center gap-3">
              <History className="size-5 text-primary" />
              <SheetTitle className="text-xl font-black">{t('workspaces.versionHistory')}</SheetTitle>
            </div>
            <SheetDescription className="font-mono text-[10px] uppercase tracking-widest">
              {historyFile?.name}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-8">
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
                    <p className="text-xs font-black">{version.versionName}</p>
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
                      <Download className="mr-1 size-3" /> {t('workspaces.download')}
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
