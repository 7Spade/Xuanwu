
"use client";

import { 
  FileText, 
  UploadCloud, 
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Button } from "@/shadcn-ui/button";
import { useWorkspaceFilesActions } from '../_hooks/use-workspace-files-actions';
import { useWorkspaceFilesQuery } from '../_hooks/use-workspace-files';
import { FileHistorySheet, type HistoryPanelTab } from './file-history-sheet';
import { FilesTable } from './files-table';
import type { WorkspaceFileWithRelations } from './files-view.utils';


/**
 * WorkspaceFiles - High-sensory file version governance center.
 * Features: Smart type detection, version history visualization, and instant sovereignty restoration.
 */
export function WorkspaceFiles() {
  const { t } = useI18n();

  const [historyFile, setHistoryFile] = useState<WorkspaceFileWithRelations | null>(null);
  const [historyTab, setHistoryTab] = useState<HistoryPanelTab>('versions');
  const { files, displayFiles } = useWorkspaceFilesQuery();
  const {
    fileInputRef,
    isUploading,
    handleUploadClick,
    handleFileSelect,
    handleRestore,
    handleDeregister,
    handleDownloadVersion,
    handleParseWithAi,
  } = useWorkspaceFilesActions({
    files,
    onRestoreSuccess: () => setHistoryFile(null),
  });

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <FileText className="size-3.5" /> {t('workspaces.spaceFileSovereignty')}
        </h3>
        <Button
            size="sm"
            className="h-9 gap-2 rounded-full text-[10px] font-black uppercase shadow-lg"
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {isUploading ? t('workspaces.uploading') : t('workspaces.uploadDocument')}
        </Button>
      </div>

      <FilesTable
        files={displayFiles}
        onOpenHistory={(file, tab = 'versions') => {
          setHistoryFile(file);
          setHistoryTab(tab);
        }}
        onDeregister={(file) => void handleDeregister(file)}
        onDownload={handleDownloadVersion}
        onParseWithAi={handleParseWithAi}
      />

      <FileHistorySheet
        historyFile={historyFile}
        defaultTab={historyTab}
        onClose={() => setHistoryFile(null)}
        onRestore={handleRestore}
        onDownloadVersion={handleDownloadVersion}
      />
    </div>
  );
}
