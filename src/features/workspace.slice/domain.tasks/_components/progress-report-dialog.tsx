import { useEffect, useState } from 'react';

import { useI18n } from '@/app-runtime/providers/i18n-provider';
import { Button } from '@/shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn-ui/dialog';
import { toast } from '@/shadcn-ui/hooks/use-toast';
import { Input } from '@/shadcn-ui/input';
import { Label } from '@/shadcn-ui/label';

import type { TaskWithChildren } from '../_types';

interface ProgressReportDialogProps {
  task: TaskWithChildren | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, newCompletedQuantity: number) => Promise<void>;
}

export function ProgressReportDialog({
  task,
  isOpen,
  onClose,
  onSubmit,
}: ProgressReportDialogProps) {
  const { t } = useI18n();
  const [submissionQuantity, setSubmissionQuantity] = useState<number | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmissionQuantity('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!task) return null;

  const currentCompleted = task.completedQuantity || 0;
  const totalQuantity = task.quantity || 1;

  const handleSubmit = async () => {
    const submitted = Number(submissionQuantity);
    if (Number.isNaN(submitted) || submitted <= 0) {
      toast({ variant: 'destructive', title: t('tasks.invalidQuantity') });
      return;
    }

    const newTotal = currentCompleted + submitted;
    if (newTotal > totalQuantity) {
      toast({ variant: 'destructive', title: t('tasks.quantityExceedsTotal') });
      return;
    }

    setIsSubmitting(true);
    await onSubmit(task.id, newTotal);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('tasks.submitProgress')}</DialogTitle>
          <DialogDescription>
            {t('tasks.submitProgressDescription', {
              name: task.name,
              current: currentCompleted,
              total: totalQuantity,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Label htmlFor="submission-quantity">{t('tasks.quantityForSubmission')}</Label>
          <Input
            id="submission-quantity"
            type="number"
            value={submissionQuantity}
            onChange={(e) => setSubmissionQuantity(e.target.value)}
            placeholder={t('tasks.submissionQuantityPlaceholder', {
              max: totalQuantity - currentCompleted,
            })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('tasks.submittingProgress') : t('tasks.submitProgress')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
