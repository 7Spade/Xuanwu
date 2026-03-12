// [職責] 建立空間的彈窗 UI
"use client";

import { useState } from "react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Button } from "@/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shadcn-ui/dialog";
import { Input } from "@/shadcn-ui/input";
import { Label } from "@/shadcn-ui/label";

import { useApp } from "../_hooks/use-app";
import { handleCreateWorkspace } from "../_use-cases";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const {
    state: { activeAccount },
  } = useApp();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await handleCreateWorkspace(name.trim(), activeAccount, () => {
        setName("");
        onOpenChange(false);
      }, t);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {t("workspaces.createLogicalSpace")}
          </DialogTitle>
          <DialogDescription>
            {t("workspaces.createDescription").replace(
              "{name}",
              activeAccount?.name || ""
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">{t("workspaces.spaceName")}</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("workspaces.spaceNamePlaceholder")}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onCreate} className="rounded-xl shadow-lg shadow-primary/20" disabled={loading || !name.trim()}>
            {loading ? t('common.creating') : t("common.confirmCreation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
