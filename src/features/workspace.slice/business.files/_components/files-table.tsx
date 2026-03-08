import {
  AlertCircle,
  Clock,
  Download,
  FileScan,
  History,
  MoreVertical,
  Trash2,
} from 'lucide-react';

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
import { formatBytes, getCurrentVersion } from './files-view.utils';

interface FilesTableProps {
  readonly files: readonly WorkspaceFile[];
  readonly onOpenHistory: (file: WorkspaceFile) => void;
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
            <TableHead className="w-[50%]">{t('workspaces.file')}</TableHead>
            <TableHead className="text-center">{t('workspaces.version')}</TableHead>
            <TableHead>{t('workspaces.size')}</TableHead>
            <TableHead>{t('workspaces.lastSynced')}</TableHead>
            <TableHead className="text-right">{t('workspaces.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const current = getCurrentVersion(file);
            return (
              <TableRow key={file.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-4">
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
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold">{current?.uploadedBy}</span>
                    <span className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                      <Clock className="size-2.5" /> {t('workspaces.synced')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/5">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
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
                        <FileScan className="size-3.5 text-primary" /> {t('workspaces.parseWithAi')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onOpenHistory(file)}
                        className="cursor-pointer gap-2 py-2.5 text-[10px] font-bold uppercase"
                      >
                        <History className="size-3.5 text-primary" /> {t('workspaces.versionHistory')}
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
