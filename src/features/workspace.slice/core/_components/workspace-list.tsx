"use client";

import { Eye, EyeOff, Shield, Trash2, ArrowUpRight, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Badge } from "@/shadcn-ui/badge";
import { Button } from "@/shadcn-ui/button";
import { ROUTES } from "@/shared-kernel";

import { type Workspace } from "../_types";

interface WorkspaceListItemProps {
  workspace: Workspace;
  onDelete?: (id: string) => void;
}

function WorkspaceListItem({ workspace, onDelete }: WorkspaceListItemProps) {
  const { t } = useI18n();
  const router = useRouter();
  const isVisible = workspace.visibility === "visible";
  const visibilityLabel = isVisible ? t('common.visible') : t('common.hidden');
  const protocolLabel = workspace.protocol || t('workspaces.defaultProtocol');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${workspace.name} workspace`}
      className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => router.push(`/workspaces/${workspace.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          router.push(`/workspaces/${workspace.id}`)
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/5 p-2 text-primary">
          <Shield className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{workspace.name}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge variant="outline" className="flex h-4 items-center gap-1 px-1.5 text-[9px] uppercase tracking-tighter">
              {isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              {visibilityLabel}
            </Badge>
            <span className="text-[10px] text-muted-foreground">ID: {workspace.id.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block">
          <p className="mb-1 text-[9px] font-bold uppercase leading-none tracking-widest text-muted-foreground">{t('workspaces.accessProtocol')}</p>
          <p className="text-[11px] font-medium">{protocolLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary">
            <ArrowUpRight className="size-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(workspace.id); }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceList({ workspaces }: { workspaces: Workspace[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const recentOnes = useMemo(() => workspaces.slice(0, 4), [workspaces]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold tracking-tight">{t('workspaces.recentWorkspaces')}</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(ROUTES.WORKSPACES)}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
        >
          {t('workspaces.viewAll')} <ArrowUpRight className="ml-1 size-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recentOnes.length > 0 ? recentOnes.map(w => (
          <WorkspaceListItem key={w.id} workspace={w} />
        )) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-8 text-center">
            <Terminal className="mb-3 size-8 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground">{t('workspaces.noWorkspaceNodes')}</p>
            <Button 
              variant="link"
              onClick={() => router.push(ROUTES.WORKSPACES)}
              className="mt-2 text-xs font-bold uppercase tracking-widest text-primary"
            >
              + {t('workspaces.createFirstNode')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
