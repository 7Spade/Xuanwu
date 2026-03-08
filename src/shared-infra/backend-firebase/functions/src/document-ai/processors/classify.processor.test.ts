import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mock the Document AI client before any imports ───────────────────────────
const { mockCallDocumentAi } = vi.hoisted(() => ({
  mockCallDocumentAi: vi.fn(),
}));

vi.mock('../clients/document-ai.client.js', () => ({
  callDocumentAi: mockCallDocumentAi,
  PROCESSOR_URLS: {
    CLASSIFIER: 'https://mock-classifier-url',
    EXTRACTOR: 'https://mock-extractor-url',
  },
}));

import { classifyDocument } from './classify.processor.js';

describe('classifyDocument', () => {
  beforeEach(() => {
    mockCallDocumentAi.mockReset();
  });

  it('returns the entity with the highest confidence as docType', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        entities: [
          { type: 'receipt', confidence: 0.6 },
          { type: 'invoice', confidence: 0.92 },
          { type: 'contract', confidence: 0.3 },
        ],
      },
    });

    const result = await classifyDocument('gs://bucket/doc.pdf', 'application/pdf');

    expect(result.docType).toBe('invoice');
    expect(result.confidence).toBeCloseTo(0.92);
  });

  it('calls the CLASSIFIER processor URL', async () => {
    mockCallDocumentAi.mockResolvedValue({ document: { entities: [] } });

    await classifyDocument('gs://bucket/doc.pdf', 'application/pdf');

    expect(mockCallDocumentAi).toHaveBeenCalledWith(
      'https://mock-classifier-url',
      'gs://bucket/doc.pdf',
      'application/pdf'
    );
  });

  it('returns docType "unknown" and confidence 0 when entities are empty', async () => {
    mockCallDocumentAi.mockResolvedValue({ document: { entities: [] } });

    const result = await classifyDocument('gs://bucket/empty.pdf', 'application/pdf');

    expect(result.docType).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('returns docType "unknown" and confidence 0 when document has no entities field', async () => {
    mockCallDocumentAi.mockResolvedValue({ document: {} });

    const result = await classifyDocument('gs://bucket/empty.pdf', 'application/pdf');

    expect(result.docType).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('handles a single entity correctly', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        entities: [{ type: 'bank_statement', confidence: 0.88 }],
      },
    });

    const result = await classifyDocument('gs://bucket/stmt.pdf', 'application/pdf');

    expect(result.docType).toBe('bank_statement');
    expect(result.confidence).toBeCloseTo(0.88);
  });

  it('defaults entity type to "unknown" when type field is absent', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        entities: [{ confidence: 0.75 }],
      },
    });

    const result = await classifyDocument('gs://bucket/doc.pdf', 'application/pdf');

    expect(result.docType).toBe('unknown');
    expect(result.confidence).toBeCloseTo(0.75);
  });

  it('propagates errors thrown by the client', async () => {
    mockCallDocumentAi.mockRejectedValue(new Error('API error 503'));

    await expect(classifyDocument('gs://bucket/doc.pdf', 'application/pdf')).rejects.toThrow(
      'API error 503'
    );
  });
});
