import { describe, expect, it } from 'vitest';

import { extractOcrText } from './ocr.processor.js';
import type { RawDocumentAiResponse } from '../clients/document-ai.client.js';

describe('extractOcrText', () => {
  it('returns the document text when present', () => {
    const response: RawDocumentAiResponse = {
      document: { text: 'Invoice Total: $500.00' },
    };

    expect(extractOcrText(response)).toBe('Invoice Total: $500.00');
  });

  it('returns empty string when text field is absent', () => {
    const response: RawDocumentAiResponse = {
      document: {},
    };

    expect(extractOcrText(response)).toBe('');
  });

  it('returns empty string when document has undefined text', () => {
    const response: RawDocumentAiResponse = {
      document: { text: undefined },
    };

    expect(extractOcrText(response)).toBe('');
  });

  it('preserves multi-line text exactly', () => {
    const multiLine = 'Line one\nLine two\nLine three';
    const response: RawDocumentAiResponse = {
      document: { text: multiLine },
    };

    expect(extractOcrText(response)).toBe(multiLine);
  });

  it('returns empty string when document object is empty (no text key)', () => {
    const response: RawDocumentAiResponse = { document: {} };
    expect(extractOcrText(response)).toBe('');
  });
});
