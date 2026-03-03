import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceTask } from '@/shared/types';

import { updateTask } from './_actions';

const { updateTaskMock } = vi.hoisted(() => ({
  updateTaskMock: vi.fn(),
}));

vi.mock('@/shared/infra/firestore/firestore.facade', () => ({
  createTask: vi.fn(),
  updateTask: updateTaskMock,
  deleteTask: vi.fn(),
}));

describe('workspace business.tasks updateTask', () => {
  beforeEach(() => {
    updateTaskMock.mockReset();
  });

  it('strips immutable SourcePointer fields from updates', async () => {
    updateTaskMock.mockResolvedValue(undefined);

    const updates: Partial<WorkspaceTask> = {
      title: 'Updated title',
      sourceIntentId: 'intent-2',
      sourceIntentVersion: 2,
      sourceFileId: 'file-2',
    };

    await updateTask('ws-1', 'task-1', updates);

    expect(updateTaskMock).toHaveBeenCalledTimes(1);
    expect(updateTaskMock).toHaveBeenCalledWith('ws-1', 'task-1', {
      title: 'Updated title',
    });
  });

  it('passes through normal updates when SourcePointer fields are absent', async () => {
    updateTaskMock.mockResolvedValue(undefined);

    const updates: Partial<WorkspaceTask> = {
      title: 'Only editable fields',
      progressState: 'doing',
    };

    await updateTask('ws-1', 'task-2', updates);

    expect(updateTaskMock).toHaveBeenCalledWith('ws-1', 'task-2', updates);
  });

  it('returns structured failure when facade update throws', async () => {
    updateTaskMock.mockRejectedValue(new Error('db down'));

    const result = await updateTask('ws-1', 'task-3', { title: 'x' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('TASK_UPDATE_FAILED');
      expect(result.error.message).toContain('db down');
    }
  });
});
