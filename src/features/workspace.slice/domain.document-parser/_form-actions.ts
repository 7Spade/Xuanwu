/**
 * Module: _form-actions.ts
 * Purpose: Execute server-side document OCR extraction and parser preparation.
 * Responsibilities: call processDocument endpoint and normalize OCR payload/errors.
 * Constraints: deterministic logic, respect module boundaries
 */

'use server';

import { extractInvoiceItems } from '@/app-runtime/ai/flows/extract-invoice-items';
import type { WorkItem } from '@/app-runtime/ai/schemas/docu-parse';

export type ActionState = {
  data?: {
    workItems: WorkItem[];
    ocrDocument: {
      source: 'document-ocr-extractor';
      mimeType: string;
      text: string;
      entities: Array<{
        type: string;
        mentionText: string;
        confidence: number;
        normalizedValue?: string;
      }>;
      traceId: string;
      extractedAt: string;
    };
  };
  error?: string;
  fileName?: string;
  parseMode?: 'document-ai' | 'genkit-ai';
};

interface ProcessDocumentFunctionResponse {
  ok?: boolean;
  error?: string;
  traceId?: string;
  extractedAt?: string;
  mimeType?: string;
  text?: string;
  entities?: Array<{
    type: string;
    mentionText: string;
    confidence: number;
    normalizedValue?: string;
  }>;
}

const truncateText = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;

async function readProcessDocumentPayload(response: Response): Promise<{
  payload: ProcessDocumentFunctionResponse | null;
  contentType: string;
  rawText?: string;
}> {
  const contentType = response.headers.get('content-type') ?? 'unknown';
  if (contentType.toLowerCase().includes('application/json')) {
    const payload = (await response.json()) as ProcessDocumentFunctionResponse;
    return { payload, contentType };
  }

  const rawText = await response.text();
  return {
    payload: null,
    contentType,
    rawText,
  };
}

export interface OcrDocumentPayload {
  source: 'document-ocr-extractor';
  mimeType: string;
  text: string;
  entities: Array<{
    type: string;
    mentionText: string;
    confidence: number;
    normalizedValue?: string;
  }>;
  traceId: string;
  extractedAt: string;
}

export async function runAiParsingFromOcrDocument(
  ocrDocument: OcrDocumentPayload
): Promise<{ workItems: WorkItem[] }> {
  const extraction = await extractInvoiceItems({
    documentObject: ocrDocument,
  });
  return {
    workItems: extraction.workItems,
  };
}

function getProcessDocumentEndpoint(): string {
  const explicit = process.env.DOCAI_PROCESS_DOCUMENT_URL;
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    'xuanwu-i-00708880-4e2d8';

  if (!projectId) {
    throw new Error('Cannot resolve Firebase project ID for processDocument endpoint. Set DOCAI_PROCESS_DOCUMENT_URL explicitly.');
  }

  const emulatorHost = process.env.FUNCTIONS_EMULATOR_HOST;
  if (emulatorHost && emulatorHost.trim().length > 0) {
    return `http://${emulatorHost}/${projectId}/asia-east1/processDocument`;
  }

  return `https://asia-east1-${projectId}.cloudfunctions.net/processDocument`;
}

export async function extractDataFromDocument(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState;

  const workspaceId = formData.get('workspaceId');
  const fileId = formData.get('fileId');
  const versionId = formData.get('versionId');
  const storagePath = formData.get('storagePath');
  const fileName = formData.get('fileName');
  const fileType = formData.get('fileType');
  const parseModeFromForm = formData.get('parseMode');
  const parseMode: 'document-ai' | 'genkit-ai' = parseModeFromForm === 'genkit-ai' ? 'genkit-ai' : 'document-ai';

  if (
    typeof workspaceId !== 'string' || workspaceId.length === 0 ||
    typeof fileId !== 'string' || fileId.length === 0 ||
    typeof versionId !== 'string' || versionId.length === 0
  ) {
    return {
      fileName: typeof fileName === 'string' ? fileName : undefined,
      parseMode,
      error: 'Please select a file from the Files tab before parsing.',
    };
  }

  try {
    const endpoint = getProcessDocumentEndpoint();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        fileId,
        versionId,
        storagePath: typeof storagePath === 'string' && storagePath.length > 0 ? storagePath : undefined,
        mimeType: typeof fileType === 'string' && fileType.length > 0 ? fileType : undefined,
        fileName: typeof fileName === 'string' && fileName.length > 0 ? fileName : undefined,
      }),
      cache: 'no-store',
    });

    const { payload, contentType, rawText } = await readProcessDocumentPayload(response);

    if (!response.ok) {
      const message = payload?.error
        ?? (rawText ? truncateText(rawText, 240) : `Document AI request failed with status ${response.status}`);
      return {
        fileName: typeof fileName === 'string' ? fileName : undefined,
        parseMode,
        error: `[${parseMode}] status=${response.status} contentType=${contentType} endpoint=${endpoint} :: ${message}`,
      };
    }

    if (!payload || payload.ok === false) {
      return {
        fileName: typeof fileName === 'string' ? fileName : undefined,
        parseMode,
        error: `[${parseMode}] Invalid processDocument payload (contentType=${contentType})`,
      };
    }

    const ocrDocument = {
      source: 'document-ocr-extractor' as const,
      mimeType: payload.mimeType ?? (typeof fileType === 'string' ? fileType : 'application/octet-stream'),
      text: payload.text ?? '',
      entities: (payload.entities ?? []).map((entity) => ({
        type: entity.type,
        mentionText: entity.mentionText,
        confidence: entity.confidence,
        ...(entity.normalizedValue ? { normalizedValue: entity.normalizedValue } : {}),
      })),
      traceId: payload.traceId ?? crypto.randomUUID(),
      extractedAt: payload.extractedAt ?? new Date().toISOString(),
    };

    return {
      fileName: typeof fileName === 'string' ? fileName : undefined,
      parseMode,
      data: {
        // Document AI and AI semantic parsing are intentionally decoupled.
        // This action only executes Document AI OCR extraction.
        workItems: [],
        ocrDocument,
      },
    };
  } catch (error) {
    return {
      fileName: typeof fileName === 'string' ? fileName : undefined,
      parseMode,
      error: error instanceof Error ? `[${parseMode}] ${error.message}` : `[${parseMode}] Unexpected parse error`,
    };
  }
}
