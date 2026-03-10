// [職責] 標題、搜尋框與視圖切換 (Grid/List)
"use client";

import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Button } from "@/shadcn-ui/button";
import { PageHeader } from "@/lib-ui/custom-ui";
import { Input } from "@/shadcn-ui/input";
import { ROUTES } from "@/shared-kernel";

interface WorkspaceListHeaderProps {
  activeAccountName: string;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function WorkspaceListHeader({
  activeAccountName,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
}: WorkspaceListHeaderProps) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <>
      <PageHeader
        title={t("workspaces.title")}
        description={t("workspaces.description").replace(
          "{name}",
          activeAccountName
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/60 bg-background p-1 shadow-sm">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="size-8 p-0"
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="size-8 p-0"
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
            >
              <ListIcon className="size-4" />
            </Button>
          </div>
          <Button
            className="h-10 gap-2 px-3 text-[11px] font-bold uppercase tracking-widest shadow-sm sm:px-4"
            onClick={() => router.push(ROUTES.WORKSPACES_NEW)}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">{t("workspaces.createSpace")}</span>
          </Button>
        </div>
      </PageHeader>
      <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("workspaces.searchPlaceholder")}
            className="h-10 rounded-xl border-border/40 bg-background pl-10 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-2 rounded-xl border-border/60 px-3 text-xs font-bold uppercase tracking-widest sm:px-4"
        >
          <Filter className="size-3.5" />
          <span className="hidden sm:inline">{t("common.filter")}</span>
        </Button>
      </div>
    </>
  );
}

