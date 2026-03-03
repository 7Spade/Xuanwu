/**
 * @fileoverview intent-actions.ts — Firestore CRUD for ParsingIntent (Digital Twin)
 * and ParsingImport execution ledger.
 *
 * Called from workspace event orchestration to persist parser outcomes before and
 * during task materialization.
 */

import type { SkillRequirement } from '@/features/shared-kernel'
import {
  createParsingImport as createParsingImportFacade,
  createParsingIntent as createParsingIntentFacade,
  getParsingImportByIdempotencyKey as getParsingImportByIdempotencyKeyFacade,
  updateParsingImportStatus as updateParsingImportStatusFacade,
  updateParsingIntentStatus as updateParsingIntentStatusFacade,
} from '@/shared/infra/firestore/firestore.facade'
import type {
  ParsedLineItem,
  IntentID,
  SourcePointer,
  ParsingImport,
  ParsingImportStatus,
} from '@/shared/types'

export const INITIAL_PARSING_INTENT_VERSION = 1

export type ParsingImportStartResult = {
  importId: string
  idempotencyKey: string
  status: ParsingImportStatus
  isDuplicate: boolean
}

export type ParsingImportFinishInput = {
  status: ParsingImportStatus
  appliedTaskIds: string[]
  error?: {
    code: string
    message: string
  }
}

/**
 * Builds the canonical idempotency key for one intent materialization attempt.
 *
 * intentId      = ParsingIntent aggregate ID.
 * intentVersion = ParsingIntent version for that aggregate snapshot.
 *
 * Format: import:{intentId}:{intentVersion}
 */
export function buildParsingImportIdempotencyKey(
  intentId: string,
  intentVersion: number
): string {
  return `import:${intentId}:${intentVersion}`
}

export async function saveParsingIntent(
  workspaceId: string,
  sourceFileName: string,
  lineItems: ParsedLineItem[],
  options?: {
    sourceFileDownloadURL?: SourcePointer
    sourceFileId?: string
    skillRequirements?: SkillRequirement[]
    intentVersion?: number
  }
): Promise<IntentID> {
  const id = await createParsingIntentFacade(workspaceId, {
    workspaceId,
    sourceFileName,
    sourceFileDownloadURL: options?.sourceFileDownloadURL,
    sourceFileId: options?.sourceFileId,
    intentVersion: options?.intentVersion ?? INITIAL_PARSING_INTENT_VERSION,
    lineItems,
    skillRequirements: options?.skillRequirements,
    status: 'pending',
  })
  return id as IntentID
}

export async function startParsingImport(
  workspaceId: string,
  intentId: string,
  intentVersion = INITIAL_PARSING_INTENT_VERSION
): Promise<ParsingImportStartResult> {
  const idempotencyKey = buildParsingImportIdempotencyKey(intentId, intentVersion)
  const existing = await getParsingImportByIdempotencyKeyFacade(
    workspaceId,
    idempotencyKey
  )

  if (existing) {
    return {
      importId: existing.id,
      idempotencyKey,
      status: existing.status,
      isDuplicate: true,
    }
  }

  const importId = await createParsingImportFacade(workspaceId, {
    workspaceId,
    intentId: intentId as ParsingImport['intentId'],
    intentVersion,
    idempotencyKey,
    status: 'started',
    appliedTaskIds: [],
  })

  return {
    importId,
    idempotencyKey,
    status: 'started',
    isDuplicate: false,
  }
}

export async function finishParsingImport(
  workspaceId: string,
  importId: string,
  input: ParsingImportFinishInput
): Promise<void> {
  await updateParsingImportStatusFacade(workspaceId, importId, {
    status: input.status,
    appliedTaskIds: input.appliedTaskIds,
    ...(input.error ? { error: input.error } : {}),
  })
}

export async function markParsingIntentImported(
  workspaceId: string,
  intentId: string
): Promise<void> {
  return updateParsingIntentStatusFacade(workspaceId, intentId, 'imported')
}
