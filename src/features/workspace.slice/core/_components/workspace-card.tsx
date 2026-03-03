// [職責] 單個 Workspace 的卡片展示
"use client";

import { MoreVertical, Eye, EyeOff, Shield, Settings, Trash2, MapPin, Hash, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useI18n } from "@/config/i18n/i18n-provider";
import { ROUTES } from "@/shared/constants/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn-ui/alert-dialog";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Button } from "@/shared/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/shared/shadcn-ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu";
import type { Workspace } from "@/shared/types";
import { toast } from "@/shared/utility-hooks/use-toast";

import { deleteWorkspace } from "../_actions";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [isDestroyOpen, setIsDestroyOpen] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);

  const handleClick = () => {
    router.push(ROUTES.WORKSPACE(workspace.id));
  };

  const handleDestroyConfirm = async () => {
    setIsDestroying(true);
    const result = await deleteWorkspace(workspace.id);
    setIsDestroying(false);
    if (!result.success) {
      toast({ variant: "destructive", title: "Failed to Destroy Space", description: result.error.message });
      return;
    }
    toast({ variant: "default", title: "Workspace node destroyed", description: `Space "${workspace.name}" has been permanently removed.` });
    setIsDestroyOpen(false);
    router.push(ROUTES.WORKSPACES);
  };

  const formattedAddress = workspace.address
    ? [
        workspace.address.street,
        workspace.address.city,
        workspace.address.state,
        workspace.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const primaryLocation = workspace.locations?.[0]?.label ?? null;

  return (
    <>
      <Card
        className="group cursor-pointer border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Shield className="size-5" />
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="flex size-6 items-center justify-center p-0 text-muted-foreground"
              >
                {workspace.visibility === "visible" ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
              </Badge>

              {/* Vertical ··· context menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:bg-accent/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={() => router.push(ROUTES.WORKSPACE_SETTINGS(workspace.id))}
                    className="gap-2"
                  >
                    <Settings className="size-3.5" />
                    Workspace Sovereignty Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDestroyOpen(true)}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Destroy Space
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardTitle className="mt-4 truncate font-headline text-lg transition-colors group-hover:text-primary">
            {workspace.name}
          </CardTitle>
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-60">
            {t("workspaces.lifecycleState")}: {workspace.lifecycleState}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Scope badges */}
          <div className="mt-1 flex min-h-[32px] flex-wrap gap-1.5">
            {(workspace.scope || []).slice(0, 3).map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="border-none bg-muted/50 px-1.5 py-0 text-[8px] uppercase tracking-tighter"
              >
                {s}
              </Badge>
            ))}
            {(workspace.scope || []).length > 3 && (
              <span className="text-[8px] text-muted-foreground opacity-60">
                +{(workspace.scope || []).length - 3}
              </span>
            )}
          </div>

          {/* Meta info: ID / Address / Location */}
          <div className="mt-3 space-y-1.5 border-t border-border/20 pt-3">
            <div className="flex items-center gap-1.5">
              <Hash className="size-3 shrink-0 text-muted-foreground/60" />
              <span className="font-mono text-[9px] text-muted-foreground">
                {workspace.id}
              </span>
            </div>
            {formattedAddress && (
              <div className="flex items-start gap-1.5">
                <MapPin className="mt-px size-3 shrink-0 text-muted-foreground/60" />
                <span className="text-[9px] leading-tight text-muted-foreground">
                  {formattedAddress}
                </span>
              </div>
            )}
            {primaryLocation && (
              <div className="flex items-start gap-1.5">
                <Building2 className="mt-px size-3 shrink-0 text-muted-foreground/60" />
                <span className="text-[9px] leading-tight text-muted-foreground">
                  {primaryLocation}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex items-center justify-between border-t border-border/20 py-4 pt-0">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase leading-none tracking-tighter text-muted-foreground">
              [{t("workspaces.defaultProtocol")}]
            </span>
            <span className="max-w-[120px] truncate font-mono text-[10px]">
              {workspace.protocol || t("workspaces.standard")}
            </span>
          </div>
          <div className="flex -space-x-1.5">
            {(workspace.grants || [])
              .filter((g) => g.status === "active")
              .slice(0, 3)
              .map((g, i) => (
                <div
                  key={g.userId ?? i}
                  className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[8px] font-bold shadow-sm"
                >
                  {g.userId?.[0].toUpperCase() || "U"}
                </div>
              ))}
          </div>
        </CardFooter>
      </Card>

      {/* Destroy Space confirmation */}
      <AlertDialog open={isDestroyOpen} onOpenChange={setIsDestroyOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl text-destructive">
              Initiate Workspace Destruction Protocol
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <span>
                You are about to permanently destroy the workspace node{" "}
                <span className="font-bold text-foreground">
                  &quot;{workspace.name}&quot;
                </span>
                .
              </span>
              <span className="mt-2 block rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-[11px] italic text-destructive">
                This action will permanently erase this workspace and all its
                subordinate atomic data and technical specifications. This
                cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDestroying}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDestroyConfirm}
              disabled={isDestroying}
            >
              {isDestroying ? "Destroying..." : "Confirm Destruction"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
