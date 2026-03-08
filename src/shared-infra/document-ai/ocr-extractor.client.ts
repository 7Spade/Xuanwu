import { z } from 'zod';

import { firebaseConfig } from '@/shared-infra/frontend-firebase/config/firebase.config';

const processDocumentResponseSchema = z.object({
  success: z.literal(true),
  text: z.string(),
  entities: z.array(
    z.object({
      type: z.string(),
      mentionText: z.string(),
      confidence: z.number(),
      normalizedValue: z.string().optional(),
    })
  ),
  traceId: z.string(),
});

const processDocumentErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
  traceId: z.string().optional(),
});

export interface OcrDocumentEntity {
  readonly type: string;
  readonly mentionText: string;
  readonly confidence: number;
  readonly normalizedValue?: string;
}

export interface OcrDocumentObject {
  readonly source: 'document-ocr-extractor';
  readonly mimeType: string;
  readonly text: string;
  readonly entities: OcrDocumentEntity[];
  readonly traceId: string;
  readonly extractedAt: string;
}

export interface ExtractDocumentObjectInput {
  readonly documentDataUri: string;
  readonly mimeType: string;
  readonly traceId?: string;
}

function getProcessDocumentEndpoint(): string {
  return `https://asia-southeast1-${firebaseConfig.projectId}.cloudfunctions.net/processDocumentFn`;
}

export async function extractDocumentObjectWithOcr(
  input: ExtractDocumentObjectInput
): Promise<OcrDocumentObject> {
  const response = await fetch(getProcessDocumentEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(input.traceId ? { 'x-trace-id': input.traceId } : {}),
    },
    body: JSON.stringify({
      documentUri: input.documentDataUri,
      mimeType: input.mimeType,
      ...(input.traceId ? { traceId: input.traceId } : {}),
    }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Document OCR Extractor returned a non-JSON response.');
  }

  if (!response.ok) {
    const parsedError = processDocumentErrorSchema.safeParse(payload);
    if (parsedError.success) {
      throw new Error(
        `Document OCR Extractor failed: ${parsedError.data.error.code} - ${parsedError.data.error.message}`
      );
    }
    throw new Error(`Document OCR Extractor failed with HTTP ${response.status}.`);
  }

  const parsed = processDocumentResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Document OCR Extractor response shape is invalid.');
  }

  return {
    source: 'document-ocr-extractor',
    mimeType: input.mimeType,
    text: parsed.data.text,
    entities: parsed.data.entities,
    traceId: parsed.data.traceId,
    extractedAt: new Date().toISOString(),
  };
}
