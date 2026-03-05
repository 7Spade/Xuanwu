import { useEffect, useState } from 'react';

import { Button } from '@/shared/shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/shadcn-ui/dialog';
import { toast } from '@/shared/shadcn-ui/hooks/use-toast';
import { Input } from '@/shared/shadcn-ui/input';
import { Label } from '@/shared/shadcn-ui/label';

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
      toast({ variant: 'destructive', title: 'Invalid quantity' });
      return;
    }

    const newTotal = currentCompleted + submitted;
    if (newTotal > totalQuantity) {
      toast({ variant: 'destructive', title: 'Quantity exceeds total' });
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
          <DialogTitle>Report Progress</DialogTitle>
          <DialogDescription>
            Submit completed quantity for &quot;{task.name}&quot;. Current: {currentCompleted} / {totalQuantity}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Label htmlFor="submission-quantity">Quantity for this submission</Label>
          <Input
            id="submission-quantity"
            type="number"
            value={submissionQuantity}
            onChange={(e) => setSubmissionQuantity(e.target.value)}
            placeholder={`e.g., 15 (max: ${totalQuantity - currentCompleted})`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Progress'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
