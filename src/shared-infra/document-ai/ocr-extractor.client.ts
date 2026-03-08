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

export class OcrExtractorError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(params: {
    message: string;
    status: number;
    code: string;
    retryable: boolean;
  }) {
    super(params.message);
    this.name = 'OcrExtractorError';
    this.status = params.status;
    this.code = params.code;
    this.retryable = params.retryable;
  }
}

function isRetryableError(status: number, code: string): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    code === 'RESOURCE_EXHAUSTED' ||
    code === 'UPSTREAM_TIMEOUT'
  );
}

function inferErrorCode(status: number, rawCode: string, message: string): string {
  if (rawCode === 'RESOURCE_EXHAUSTED') {
    return rawCode;
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|API error 429/i.test(message)) {
    return 'RESOURCE_EXHAUSTED';
  }
  if (status === 408 || status === 504) {
    return 'UPSTREAM_TIMEOUT';
  }
  return rawCode;
}

function formatUserFacingMessage(code: string, fallback: string): string {
  if (code === 'RESOURCE_EXHAUSTED') {
    return 'Document OCR quota is temporarily exhausted. Please retry in 1-2 minutes.';
  }
  if (code === 'UPSTREAM_TIMEOUT') {
    return 'Document OCR timed out. Please retry with a smaller or clearer file.';
  }
  return fallback;
}

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
  readonly sourceRef?: {
    readonly workspaceId: string;
    readonly fileId: string;
  };
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
      ...(input.sourceRef ? { sourceRef: input.sourceRef } : {}),
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
      const code = inferErrorCode(
        response.status,
        parsedError.data.error.code,
        parsedError.data.error.message
      );
      throw new OcrExtractorError({
        message: formatUserFacingMessage(
          code,
          `Document OCR Extractor failed: ${code} - ${parsedError.data.error.message}`
        ),
        status: response.status,
        code,
        retryable: isRetryableError(response.status, code),
      });
    }
    throw new OcrExtractorError({
      message: `Document OCR Extractor failed with HTTP ${response.status}.`,
      status: response.status,
      code: 'UNKNOWN_OCR_ERROR',
      retryable: isRetryableError(response.status, 'UNKNOWN_OCR_ERROR'),
    });
  }

  const parsed = processDocumentResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new OcrExtractorError({
      message: 'Document OCR Extractor response shape is invalid.',
      status: response.status,
      code: 'INVALID_OCR_RESPONSE',
      retryable: false,
    });
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
