import {
  AlertCircle,
  Check,
  Clock,
  Download,
  FileScan,
  History,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Fragment } from 'react';

import { useI18n } from '@/app-runtime/providers/i18n-provider';
import { Badge } from '@/shadcn-ui/badge';
import { Button } from '@/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shadcn-ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shadcn-ui/table';

import type { WorkspaceFile, WorkspaceFileVersion } from '../_types';

import { FileTypeIcon } from './file-type-icon';
import { formatBytes, getCurrentVersion, getStructuredDataSnapshot } from './files-view.utils';

interface FilesTableProps {
  readonly files: readonly WorkspaceFile[];
  readonly onOpenHistory: (file: WorkspaceFile, tab?: 'versions' | 'structured' | 'processing') => void;
  readonly onDeregister: (file: WorkspaceFile) => void;
  readonly onDownload: (version?: WorkspaceFileVersion) => void;
  readonly onParseWithAi: (file: WorkspaceFile, version?: WorkspaceFileVersion) => void;
}

export function FilesTable({
  files,
  onOpenHistory,
  onDeregister,
  onDownload,
  onParseWithAi,
}: FilesTableProps) {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-sm backdrop-blur-md">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[48%]">{t('workspaces.file')}</TableHead>
            <TableHead className="text-center">{t('workspaces.version')}</TableHead>
            <TableHead>{t('workspaces.size')}</TableHead>
            <TableHead className="text-right">{t('workspaces.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const current = getCurrentVersion(file);
            const summary = getStructuredDataSnapshot(file, current);
            const summaryText = JSON.stringify(summary.summary, null, 2);

            return (
              <Fragment key={file.id}>
                <TableRow className="group border-b-0">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      <div className="flex size-6 items-center justify-center rounded border border-primary/30 bg-primary/10 text-primary">
                        <Check className="size-3.5" />
                      </div>
                      <div className="rounded-xl border bg-background p-2.5 text-primary shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                        <FileTypeIcon fileName={file.name} />
                      </div>
                      <span className="truncate text-sm font-black tracking-tight">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="h-5 border-none bg-primary/10 text-[9px] font-black text-primary">
                      V{current?.versionNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] uppercase text-muted-foreground">
                    {formatBytes(current?.size || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/5">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-xl">
                        <DropdownMenuItem
                          onClick={() => onDownload(current)}
                          disabled={!current?.downloadURL}
                          className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase"
                        >
                          <Download className="size-3.5 text-primary" /> {t('workspaces.download')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!current?.downloadURL}
                          onClick={() => onParseWithAi(file, current)}
                          className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase"
                        >
                          <FileScan className="size-3.5 text-primary" /> {t('workspaces.reparse')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onOpenHistory(file, 'versions')}
                          className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase"
                        >
                          <History className="size-3.5 text-primary" /> {t('workspaces.versionHistory')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onOpenHistory(file, 'structured')}
                          className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase"
                        >
                          <Clock className="size-3.5 text-primary" /> {t('workspaces.structuredData')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeregister(file)}
                          className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase text-destructive"
                        >
                          <Trash2 className="size-3.5" /> {t('workspaces.deregisterFile')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="pt-0">
                    <div className="ml-10 rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-primary">
                        {t('workspaces.structuredSummary')}
                      </p>
                      <pre className="overflow-x-auto rounded-md bg-background/70 p-3 text-[10px] leading-relaxed text-foreground/90">{summaryText}</pre>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-bold"
                          onClick={() => onOpenHistory(file, 'structured')}
                        >
                          {t('workspaces.viewFullJson')}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-[10px] font-bold"
                          disabled={!current?.downloadURL}
                          onClick={() => onParseWithAi(file, current)}
                        >
                          {t('workspaces.reparse')}
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>

      {files.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-20 text-center opacity-20">
          <AlertCircle className="size-12" />
          <p className="text-[10px] font-black uppercase tracking-widest">{t('workspaces.noTechnicalDocuments')}</p>
        </div>
      )}
    </div>
  );
}
