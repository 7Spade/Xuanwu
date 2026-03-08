import { describe, expect, it } from 'vitest';

import {
  mapToDocumentParsingIntent,
  mapExtractionToIntent,
} from './document-ai-to-intent.mapper.js';
import type { ClassificationResult } from '../processors/classify.processor.js';
import type { ExtractionResult } from '../processors/extract.processor.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FIXED_TIMESTAMP = '2026-01-01T00:00:00.000Z';

const classification: ClassificationResult = {
  docType: 'invoice',
  confidence: 0.92,
};

const extraction: ExtractionResult = {
  text: 'Invoice Total: $500.00',
  entities: [
    {
      type: 'total_amount',
      mentionText: '$500.00',
      confidence: 0.97,
      normalizedValue: '500.00',
    },
  ],
};

const emptyExtraction: ExtractionResult = { text: '', entities: [] };

// ── mapToDocumentParsingIntent ─────────────────────────────────────────────────

describe('mapToDocumentParsingIntent', () => {
  it('maps classification + extraction into a DocumentParsingIntent', () => {
    const intent = mapToDocumentParsingIntent(classification, extraction, FIXED_TIMESTAMP);

    expect(intent).toMatchObject({
      docType: 'invoice',
      classifyConfidence: 0.92,
      rawText: 'Invoice Total: $500.00',
      parsedAt: FIXED_TIMESTAMP,
    });
    expect(intent.entities).toHaveLength(1);
    expect(intent.entities[0]).toMatchObject({
      type: 'total_amount',
      mentionText: '$500.00',
      confidence: 0.97,
      normalizedValue: '500.00',
    });
  });

  it('carries an empty entities array when extraction has no entities', () => {
    const intent = mapToDocumentParsingIntent(classification, emptyExtraction, FIXED_TIMESTAMP);

    expect(intent.entities).toHaveLength(0);
    expect(intent.rawText).toBe('');
  });

  it('uses the injected parsedAt timestamp exactly', () => {
    const ts = '2025-06-15T12:00:00.000Z';
    const intent = mapToDocumentParsingIntent(classification, extraction, ts);

    expect(intent.parsedAt).toBe(ts);
  });

  it('defaults parsedAt to a valid ISO-8601 string when not provided', () => {
    const before = Date.now();
    const intent = mapToDocumentParsingIntent(classification, extraction);
    const after = Date.now();

    const parsedMs = new Date(intent.parsedAt).getTime();
    expect(parsedMs).toBeGreaterThanOrEqual(before);
    expect(parsedMs).toBeLessThanOrEqual(after);
  });

  it('reflects low-confidence classification correctly', () => {
    const lowConf: ClassificationResult = { docType: 'unknown', confidence: 0 };
    const intent = mapToDocumentParsingIntent(lowConf, extraction, FIXED_TIMESTAMP);

    expect(intent.docType).toBe('unknown');
    expect(intent.classifyConfidence).toBe(0);
  });
});

// ── mapExtractionToIntent ──────────────────────────────────────────────────────

describe('mapExtractionToIntent', () => {
  it('builds an intent from extraction only with classifyConfidence set to 0', () => {
    const intent = mapExtractionToIntent(extraction, 'receipt', FIXED_TIMESTAMP);

    expect(intent).toMatchObject({
      docType: 'receipt',
      classifyConfidence: 0,
      rawText: 'Invoice Total: $500.00',
      parsedAt: FIXED_TIMESTAMP,
    });
    expect(intent.entities).toHaveLength(1);
  });

  it('defaults docType to "unknown" when not provided', () => {
    const intent = mapExtractionToIntent(extraction, undefined, FIXED_TIMESTAMP);

    expect(intent.docType).toBe('unknown');
  });

  it('carries an empty entities array when extraction has no entities', () => {
    const intent = mapExtractionToIntent(emptyExtraction, 'contract', FIXED_TIMESTAMP);

    expect(intent.entities).toHaveLength(0);
    expect(intent.rawText).toBe('');
  });

  it('defaults parsedAt to a valid ISO-8601 string when not provided', () => {
    const before = Date.now();
    const intent = mapExtractionToIntent(extraction);
    const after = Date.now();

    const parsedMs = new Date(intent.parsedAt).getTime();
    expect(parsedMs).toBeGreaterThanOrEqual(before);
    expect(parsedMs).toBeLessThanOrEqual(after);
  });
});
