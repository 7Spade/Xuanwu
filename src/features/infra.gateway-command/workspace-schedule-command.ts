/**
 * Module: workspace-schedule-command
 * Purpose: Route workspace schedule creation through command gateway entry
 * Responsibilities: register/create schedule command handler and expose dispatch helper
 * Constraints: deterministic logic, respect module boundaries
 */

import { createScheduleItem } from '@/features/workforce-scheduling.slice';
import type { AuthoritySnapshot, CommandResult } from '@/shared-kernel';

import {
  dispatchCommand,
  registerCommandHandler,
  type GatewayCommand,
} from './_gateway';

const CREATE_SCHEDULE_ITEM_COMMAND = 'workspace:schedule:createItem';

type CreateScheduleItemInput = Parameters<typeof createScheduleItem>[0];

interface CreateScheduleItemCommand extends GatewayCommand {
  readonly commandType: typeof CREATE_SCHEDULE_ITEM_COMMAND;
  readonly aggregateId: string;
  readonly input: CreateScheduleItemInput;
}

let scheduleCommandHandlerRegistered = false;

function ensureScheduleCommandHandlerRegistered(): void {
  if (scheduleCommandHandlerRegistered) return;

  registerCommandHandler<CreateScheduleItemCommand>(
    CREATE_SCHEDULE_ITEM_COMMAND,
    async (command) => createScheduleItem(command.input),
  );

  scheduleCommandHandlerRegistered = true;
}

export async function dispatchCreateScheduleItemCommand(
  workspaceId: string,
  input: CreateScheduleItemInput,
  authority: AuthoritySnapshot | null,
): Promise<CommandResult> {
  ensureScheduleCommandHandlerRegistered();

  return dispatchCommand<CreateScheduleItemCommand>(
    {
      commandType: CREATE_SCHEDULE_ITEM_COMMAND,
      aggregateId: workspaceId,
      input,
    },
    { authority },
  );
}
