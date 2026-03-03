import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockCreateParsingIntent,
  mockUpdateParsingIntentStatus,
  mockCreateParsingImport,
  mockGetParsingImportByIdempotencyKey,
  mockUpdateParsingImportStatus,
} = vi.hoisted(() => ({
  mockCreateParsingIntent: vi.fn(),
  mockUpdateParsingIntentStatus: vi.fn(),
  mockCreateParsingImport: vi.fn(),
  mockGetParsingImportByIdempotencyKey: vi.fn(),
  mockUpdateParsingImportStatus: vi.fn(),
}))

vi.mock('@/shared/infra/firestore/firestore.facade', () => ({
  createParsingIntent: mockCreateParsingIntent,
  updateParsingIntentStatus: mockUpdateParsingIntentStatus,
  createParsingImport: mockCreateParsingImport,
  getParsingImportByIdempotencyKey: mockGetParsingImportByIdempotencyKey,
  updateParsingImportStatus: mockUpdateParsingImportStatus,
}))

import {
  buildParsingImportIdempotencyKey,
  finishParsingImport,
  markParsingIntentImported,
  saveParsingIntent,
  startParsingImport,
} from './_intent-actions'

describe('workspace document-parser intent actions', () => {
  beforeEach(() => {
    mockCreateParsingIntent.mockReset()
    mockUpdateParsingIntentStatus.mockReset()
    mockCreateParsingImport.mockReset()
    mockGetParsingImportByIdempotencyKey.mockReset()
    mockUpdateParsingImportStatus.mockReset()
  })

  it('builds deterministic parsing import idempotency key', () => {
    expect(buildParsingImportIdempotencyKey('intent-1', 2)).toBe('import:intent-1:2')
  })

  it('saves parsing intent with default intentVersion=1', async () => {
    mockCreateParsingIntent.mockResolvedValue('intent-1')

    const id = await saveParsingIntent('workspace-1', 'invoice.pdf', [
      { name: 'item', quantity: 1, unitPrice: 100, subtotal: 100 },
    ])

    expect(id).toBe('intent-1')
    expect(mockCreateParsingIntent).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({
        sourceFileName: 'invoice.pdf',
        intentVersion: 1,
        status: 'pending',
      })
    )
  })

  it('returns duplicate start result when parsing import already exists', async () => {
    mockGetParsingImportByIdempotencyKey.mockResolvedValue({
      id: 'import-existing',
      status: 'applied',
    })

    const result = await startParsingImport('workspace-1', 'intent-1', 3)

    expect(result).toEqual({
      importId: 'import-existing',
      idempotencyKey: 'import:intent-1:3',
      status: 'applied',
      isDuplicate: true,
    })
    expect(mockCreateParsingImport).not.toHaveBeenCalled()
  })

  it('creates started parsing import when idempotency key is new', async () => {
    mockGetParsingImportByIdempotencyKey.mockResolvedValue(null)
    mockCreateParsingImport.mockResolvedValue('import-1')

    const result = await startParsingImport('workspace-1', 'intent-1', 1)

    expect(mockCreateParsingImport).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({
        workspaceId: 'workspace-1',
        intentId: 'intent-1',
        intentVersion: 1,
        idempotencyKey: 'import:intent-1:1',
        status: 'started',
        appliedTaskIds: [],
      })
    )
    expect(result).toEqual({
      importId: 'import-1',
      idempotencyKey: 'import:intent-1:1',
      status: 'started',
      isDuplicate: false,
    })
  })

  it('finishes parsing import with status payload', async () => {
    await finishParsingImport('workspace-1', 'import-1', {
      status: 'partial',
      appliedTaskIds: ['task-1'],
      error: {
        code: 'PARSING_IMPORT_PARTIAL',
        message: '1 task failed',
      },
    })

    expect(mockUpdateParsingImportStatus).toHaveBeenCalledWith(
      'workspace-1',
      'import-1',
      {
        status: 'partial',
        appliedTaskIds: ['task-1'],
        error: {
          code: 'PARSING_IMPORT_PARTIAL',
          message: '1 task failed',
        },
      }
    )
  })

  it('marks parsing intent imported', async () => {
    await markParsingIntentImported('workspace-1', 'intent-1')

    expect(mockUpdateParsingIntentStatus).toHaveBeenCalledWith(
      'workspace-1',
      'intent-1',
      'imported'
    )
  })
})
