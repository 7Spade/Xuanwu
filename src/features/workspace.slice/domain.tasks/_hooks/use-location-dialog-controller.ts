/**
 * Module: use-location-dialog-controller.ts
 * Purpose: isolate location dialog state and save workflow for WBS Governance
 * Responsibilities: open/close dialog, edit location draft, persist location update
 * Constraints: deterministic logic, respect module boundaries
 */

'use client';

import { useState } from 'react';

import { toast } from '@/shadcn-ui/hooks/use-toast';

import { type Location, type TaskWithChildren, type WorkspaceTask } from '../_types';

type UpdateTask = (taskId: string, updates: Partial<WorkspaceTask>) => Promise<void>;
type LogAuditEvent = (action: string, target: string, operation: 'create' | 'update' | 'delete') => void;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useLocationDialogController(params: {
  updateTask: UpdateTask;
  logAuditEvent: LogAuditEvent;
}) {
  const { updateTask, logAuditEvent } = params;

  const [locationTask, setLocationTask] = useState<TaskWithChildren | null>(null);
  const [locationDraft, setLocationDraft] = useState<Location>({ description: '' });
  const [isLocationSaving, setIsLocationSaving] = useState(false);

  const openLocation = (task: TaskWithChildren) => {
    setLocationTask(task);
    setLocationDraft({
      building: task.location?.building,
      floor: task.location?.floor,
      room: task.location?.room,
      description: task.location?.description || '',
    });
  };

  const closeLocation = () => {
    setLocationTask(null);
  };

  const updateDraft = (field: keyof Location, value: string) => {
    setLocationDraft((prev) => ({
      ...prev,
      description: prev.description || '',
      [field]: value,
    }));
  };

  const saveLocation = async () => {
    if (!locationTask) return;
    setIsLocationSaving(true);

    try {
      await updateTask(locationTask.id, { location: locationDraft });
      logAuditEvent('Updated Task Location', locationTask.name, 'update');
      closeLocation();
      toast({ title: 'Location Updated' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Location',
        description: getErrorMessage(error, 'An unknown error occurred.'),
      });
    } finally {
      setIsLocationSaving(false);
    }
  };

  return {
    locationTask,
    locationDraft,
    isLocationSaving,
    openLocation,
    closeLocation,
    updateDraft,
    saveLocation,
  };
}
