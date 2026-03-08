'use server';

import { extractInvoiceItems } from '@/app-runtime/ai/flows/extract-invoice-items';
import type { WorkItem } from '@/app-runtime/ai/schemas/docu-parse';

export type ActionState = {
  data?: { workItems: WorkItem[] };
  error?: string;
  fileName?: string;
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

function getProcessDocumentEndpoint(): string {
  const explicit = process.env.DOCAI_PROCESS_DOCUMENT_URL;
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required for processDocument endpoint resolution.');
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

  if (
    typeof workspaceId !== 'string' || workspaceId.length === 0 ||
    typeof fileId !== 'string' || fileId.length === 0 ||
    typeof versionId !== 'string' || versionId.length === 0
  ) {
    return {
      fileName: typeof fileName === 'string' ? fileName : undefined,
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

    const payload = (await response.json()) as ProcessDocumentFunctionResponse;
    if (!response.ok || payload.ok === false) {
      return {
        fileName: typeof fileName === 'string' ? fileName : undefined,
        error: payload.error ?? `Document AI request failed with status ${response.status}`,
      };
    }

    const extraction = await extractInvoiceItems({
      documentObject: {
        source: 'document-ocr-extractor',
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
      },
    });

    return {
      fileName: typeof fileName === 'string' ? fileName : undefined,
      data: {
        workItems: extraction.workItems,
      },
    };
  } catch (error) {
    return {
      fileName: typeof fileName === 'string' ? fileName : undefined,
      error: error instanceof Error ? error.message : 'Unexpected parse error',
    };
  }
}
