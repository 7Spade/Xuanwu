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

import { extractDocument } from './extract.processor.js';

describe('extractDocument', () => {
  beforeEach(() => {
    mockCallDocumentAi.mockReset();
  });

  it('returns OCR text and mapped entities from the extractor response', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        text: 'Invoice Total: $500.00',
        entities: [
          {
            type: 'total_amount',
            mentionText: '$500.00',
            confidence: 0.97,
            normalizedValue: { text: '500.00' },
          },
        ],
      },
    });

    const result = await extractDocument('gs://bucket/invoice.pdf', 'application/pdf');

    expect(result.text).toBe('Invoice Total: $500.00');
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0]).toMatchObject({
      type: 'total_amount',
      mentionText: '$500.00',
      confidence: 0.97,
      normalizedValue: '500.00',
    });
  });

  it('calls the EXTRACTOR processor URL', async () => {
    mockCallDocumentAi.mockResolvedValue({ document: {} });

    await extractDocument('gs://bucket/doc.pdf', 'application/pdf');

    expect(mockCallDocumentAi).toHaveBeenCalledWith(
      'https://mock-extractor-url',
      'gs://bucket/doc.pdf',
      'application/pdf'
    );
  });

  it('returns empty text and empty entities when document is empty', async () => {
    mockCallDocumentAi.mockResolvedValue({ document: {} });

    const result = await extractDocument('gs://bucket/blank.pdf', 'application/pdf');

    expect(result.text).toBe('');
    expect(result.entities).toHaveLength(0);
  });

  it('omits normalizedValue when not present in raw entity', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        text: 'Some text',
        entities: [{ type: 'item', mentionText: 'item name', confidence: 0.5 }],
      },
    });

    const result = await extractDocument('gs://bucket/doc.pdf', 'application/pdf');

    expect(result.entities[0]).not.toHaveProperty('normalizedValue');
  });

  it('defaults entity type and mentionText to "unknown" / "" when absent', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        text: 'text',
        entities: [{ confidence: 0.3 }],
      },
    });

    const result = await extractDocument('gs://bucket/doc.pdf', 'application/pdf');

    expect(result.entities[0].type).toBe('unknown');
    expect(result.entities[0].mentionText).toBe('');
    expect(result.entities[0].confidence).toBeCloseTo(0.3);
  });

  it('handles multiple entities correctly', async () => {
    mockCallDocumentAi.mockResolvedValue({
      document: {
        text: 'Vendor: Acme Corp\nAmount: $1,200',
        entities: [
          { type: 'supplier_name', mentionText: 'Acme Corp', confidence: 0.95 },
          { type: 'total_amount', mentionText: '$1,200', confidence: 0.99 },
        ],
      },
    });

    const result = await extractDocument('gs://bucket/invoice2.pdf', 'application/pdf');

    expect(result.entities).toHaveLength(2);
    expect(result.entities.map((e) => e.type)).toEqual(['supplier_name', 'total_amount']);
  });

  it('propagates errors thrown by the client', async () => {
    mockCallDocumentAi.mockRejectedValue(new Error('Network timeout'));

    await expect(extractDocument('gs://bucket/doc.pdf', 'application/pdf')).rejects.toThrow(
      'Network timeout'
    );
  });
});
