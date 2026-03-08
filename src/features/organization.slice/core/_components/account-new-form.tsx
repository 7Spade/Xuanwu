"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useApp } from "@/app-runtime/providers/app-provider";
import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { Button } from "@/shadcn-ui/button";
import { toast } from "@/shadcn-ui/hooks/use-toast";
import { Input } from "@/shadcn-ui/input";
import { Label } from "@/shadcn-ui/label";

import { useOrganizationManagement } from "../_hooks/use-organization-management";


interface AccountNewFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountNewForm({ onSuccess, onCancel }: AccountNewFormProps) {
  const { t } = useI18n();
  const { createOrganization } = useOrganizationManagement();
  const { state: appState, dispatch } = useApp();
  const { activeAccount } = appState;

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const organizationName = name.trim();
      const newOrganizationId = await createOrganization(organizationName);
      dispatch({
        type: "SET_ACTIVE_ACCOUNT",
        payload: {
          id: newOrganizationId,
          name: organizationName,
          accountType: "organization",
          ownerId: activeAccount?.id,
        },
      });
      toast({ title: t("dimension.newDimensionCreated") });
      onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast({ variant: "destructive", title: t("dimension.failedToCreate"), description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t("dimension.dimensionName")}
        </Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          placeholder={t("dimension.dimensionNamePlaceholder")}
          className="h-12 rounded-xl"
        />
      </div>
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
          disabled={isLoading}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleCreate}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("common.creating")}
            </>
          ) : (
            t("dimension.createDimension")
          )}
        </Button>
      </div>
    </div>
  );
}
