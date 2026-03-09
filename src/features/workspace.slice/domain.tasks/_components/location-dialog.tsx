/**
 * Module: location-dialog.tsx
 * Purpose: render standalone location details dialog for WBS Governance
 * Responsibilities: display task location details in a focused modal
 * Constraints: deterministic logic, respect module boundaries
 */

'use client';

import { Loader2, MapPin } from 'lucide-react';

import { useI18n } from '@/app-runtime/providers/i18n-provider';
import { Button } from '@/shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn-ui/dialog';
import { Input } from '@/shadcn-ui/input';
import { Label } from '@/shadcn-ui/label';
import { Textarea } from '@/shadcn-ui/textarea';

import { type Location } from '../_types';

type LocationDialogProps = {
  isOpen: boolean;
  draft: Location;
  onDraftChange: (field: keyof Location, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LocationDialog({
  isOpen,
  draft,
  onDraftChange,
  onSave,
  isSaving,
  onOpenChange,
}: LocationDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {t('schedule.location')}
          </DialogTitle>
          <DialogDescription>{t('tasks.locationDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t('tasks.locationBuilding')}</Label>
              <Input
                value={draft.building || ''}
                onChange={(event) => onDraftChange('building', event.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('tasks.locationFloor')}</Label>
              <Input
                value={draft.floor || ''}
                onChange={(event) => onDraftChange('floor', event.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('tasks.locationRoom')}</Label>
              <Input
                value={draft.room || ''}
                onChange={(event) => onDraftChange('room', event.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('settings.dimensionDescription')}</Label>
            <Textarea
              rows={3}
              value={draft.description || ''}
              onChange={(event) => onDraftChange('description', event.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={isSaving} className="rounded-lg">
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isSaving ? t('common.saving') : t('tasks.saveLocation')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
