import type { MutableRefObject } from 'react';

import { ParserRoutingStatus, shouldMaterializeAsTask } from '@/features/semantic-graph.slice';
import {
  finishParsingImport,
  markParsingIntentFailed,
  markParsingIntentImported,
  startParsingImport,
} from '@/features/workspace.slice/domain.document-parser';
import { createTask, hasTasksForSourceIntent, reconcileIntentTasks } from '@/features/workspace.slice/domain.tasks';
import type { WorkspaceTask } from '@/features/workspace.slice/domain.tasks/_types';
import type { DocumentParserItemsExtractedPayload } from '@/features/workspace.slice/core.event-bus';
import { toast } from '@/shadcn-ui/hooks/use-toast';
import { ToastAction } from '@/shadcn-ui/toast';

const PARSING_IMPORT_TERMINAL_STATUSES = new Set([
  'applied',
  'partial',
  'failed',
]);

interface CreateWorkspaceImportHandlerInput {
  workspaceId: string;
  inProgressImports: MutableRefObject<Set<string>>;
  toastLongDurationMs: number;
  logAuditEvent: (action: string, detail: string, type: 'create' | 'update' | 'delete') => Promise<void>;
}

export function createWorkspaceImportHandler(input: CreateWorkspaceImportHandlerInput) {
  return (payload: DocumentParserItemsExtractedPayload) => {
    const shouldCreateTask = (item: DocumentParserItemsExtractedPayload['items'][number]): boolean => {
      if (item.routingStatus) {
        return item.routingStatus === ParserRoutingStatus.TASK_CANDIDATE
      }
      return shouldMaterializeAsTask(item.costItemType)
    }

    const importItems = () => {
      if (input.inProgressImports.current.has(payload.intentId)) {
        toast({
          title: 'Import In Progress',
          description: 'An import for this document is already running. Please wait.',
        });
        return;
      }
      input.inProgressImports.current.add(payload.intentId);

      toast({
        title: 'Importing items...',
        description: 'Please wait a moment.',
      });

      const items: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>[] = payload.items.flatMap((item, originalIndex) =>
        shouldCreateTask(item)
          ? [{
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              ...(item.discount !== undefined ? { discount: item.discount } : {}),
              subtotal: item.subtotal,
              progress: 0,
              type: item.taskTypeName ?? 'Imported',
              priority: 'medium',
              status: 'draft',
              sourceIntentIndex: item.sourceIntentIndex ?? originalIndex,
              ...(item.requiredSkills?.length
                ? { requiredSkills: item.requiredSkills }
                : payload.skillRequirements?.length
                  ? { requiredSkills: payload.skillRequirements }
                  : {}),
            }]
          : [],
      );

      const skippedItems = payload.items.filter((item) => !shouldCreateTask(item));
      const skippedSummaryLines = skippedItems.map(
        (item) => `• [${item.routingStatus ?? 'EXCLUDED'} / ${item.lineItemType ?? item.costItemType}] ${item.name}`
      );

      hasTasksForSourceIntent(input.workspaceId, payload.intentId)
        .then((alreadyImported) => {
          if (alreadyImported) {
            toast({
              title: 'Already Imported',
              description: payload.sourceDocument
                ? `Tasks for document "${payload.sourceDocument}" have already been imported.`
                : 'Tasks for this document have already been imported.',
            });
            return;
          }

          return startParsingImport(input.workspaceId, payload.intentId, payload.intentVersion)
            .then(async (startResult) => {
              if (startResult.isDuplicate) {
                const isTerminalStatus = PARSING_IMPORT_TERMINAL_STATUSES.has(startResult.status);
                if (isTerminalStatus) {
                  toast({
                    title: 'Import Already Processed',
                    description: `Idempotency key ${startResult.idempotencyKey} already processed with status ${startResult.status}.`,
                  });
                  return;
                }

                toast({
                  title: 'Import In Progress',
                  description: `Idempotency key ${startResult.idempotencyKey} is already running. Please retry after it completes.`,
                });
                return;
              }

              const executablePayloadItems = payload.items.flatMap((item, originalIndex) =>
                shouldCreateTask(item)
                  ? [{
                      ...item,
                      sourceIntentIndex: item.sourceIntentIndex ?? originalIndex,
                    }]
                  : [],
              );

              const taskResults = payload.oldIntentId
                ? await reconcileIntentTasks(
                    input.workspaceId,
                    payload.oldIntentId,
                    payload.intentId,
                    payload.intentVersion,
                    executablePayloadItems,
                    {
                      progress: 0,
                      type: 'Imported',
                      priority: 'medium',
                      status: 'draft',
                      ...(payload.skillRequirements?.length
                        ? { requiredSkills: payload.skillRequirements }
                        : {}),
                    },
                  ).then((result) => executablePayloadItems.map(() => result))
                : await Promise.all(items.map((item) => createTask(input.workspaceId, item)));

              const successfulTaskIds = taskResults
                .filter((result) => result.success)
                .map((result) => result.aggregateId);
              const failedCount = taskResults.length - successfulTaskIds.length;

              if (failedCount > 0) {
                await finishParsingImport(input.workspaceId, startResult.importId, {
                  status: successfulTaskIds.length > 0 ? 'partial' : 'failed',
                  appliedTaskIds: successfulTaskIds,
                  error: {
                    code: successfulTaskIds.length > 0 ? 'PARSING_IMPORT_PARTIAL' : 'PARSING_IMPORT_FAILED',
                    message: `${failedCount} task(s) failed during materialization.`,
                  },
                });

                try {
                  await markParsingIntentFailed(input.workspaceId, payload.intentId);
                } catch (error: unknown) {
                  console.error('Error marking intent status as failed:', error);
                }

                toast({
                  variant: 'destructive',
                  title: successfulTaskIds.length > 0 ? 'Import Partially Applied' : 'Import Failed',
                  description: successfulTaskIds.length > 0
                    ? `${successfulTaskIds.length} tasks imported, ${failedCount} failed.`
                    : 'No tasks were imported.',
                });
                return;
              }

              await finishParsingImport(input.workspaceId, startResult.importId, {
                status: 'applied',
                appliedTaskIds: successfulTaskIds,
              });

              let statusWritebackWarning: string | undefined;
              try {
                await markParsingIntentImported(input.workspaceId, payload.intentId);
              } catch (error: unknown) {
                statusWritebackWarning = error instanceof Error
                  ? error.message
                  : 'Unknown error updating parsing intent status (check network/permissions)';
                console.error('Failed to mark intent imported:', error);
              }

              toast({
                title: statusWritebackWarning
                  ? 'Import Successful with Warning'
                  : 'Import Successful',
                description: statusWritebackWarning
                  ? `${successfulTaskIds.length} tasks have been added; intent status update failed: ${statusWritebackWarning}`
                  : skippedSummaryLines.length > 0
                    ? `${successfulTaskIds.length} task(s) added; ${skippedSummaryLines.length} non-task item(s) routed to auto-acceptance/finance.`
                    : `${successfulTaskIds.length} tasks have been added.`,
              });
              await input.logAuditEvent(
                'Imported Tasks',
                `Imported ${successfulTaskIds.length} items from ${payload.sourceDocument}`,
                'create',
              );
            })
            .catch(async (error: unknown) => {
              try {
                await markParsingIntentFailed(input.workspaceId, payload.intentId);
              } catch (statusError: unknown) {
                console.error('Error marking intent status as failed:', statusError);
              }

              const message = error instanceof Error ? error.message : 'Import failed';
              toast({
                variant: 'destructive',
                title: 'Import Failed',
                description: message,
              });
            });
        })
        .finally(() => {
          input.inProgressImports.current.delete(payload.intentId);
        });
    };

    if (payload.autoImport) {
      importItems();
      return;
    }

    const taskCandidateCount = payload.items.filter((item) => shouldCreateTask(item)).length;
    const nonTaskCount = payload.items.length - taskCandidateCount;
    const itemBreakdown = nonTaskCount > 0
      ? `${taskCandidateCount} task candidate(s), ${nonTaskCount} non-task item(s) will be routed to auto-acceptance/finance.`
      : 'Do you want to import them as new root tasks?';

    toast({
      title: `Found ${payload.items.length} items from "${payload.sourceDocument}".`,
      description: itemBreakdown,
      duration: input.toastLongDurationMs,
      action: (
        <ToastAction altText="Import" onClick={importItems}>
          Import
        </ToastAction>
      ),
    });
  };
}
