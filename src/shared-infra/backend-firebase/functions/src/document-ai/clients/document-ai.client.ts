/**
 * document-ai.client.ts — Document AI HTTP Client
 *
 * Single responsibility: send requests to the Google Document AI REST API
 * in the asia-southeast1 region and return the raw API response.
 *
 * Authentication: Application Default Credentials via Firebase Admin SDK,
 * which automatically uses the Cloud Functions service account at runtime.
 *
 * Constraints:
 *   - No business logic; only transport concerns live here.
 *   - Supports both GCS URIs (`gs://...`) and data URIs (`data:...;base64,...`).
 */

import { getApp } from "firebase-admin/app";

const DOCAI_BASE_URL =
  "https://asia-southeast1-documentai.googleapis.com/v1";

/** Processor endpoint constants */
export const PROCESSOR_URLS = {
  /** Document OCR Classifier */
  CLASSIFIER:
    `${DOCAI_BASE_URL}/projects/65970295651/locations/asia-southeast1/processors/94f84cf3b653b085:process`,
  /** Document OCR Extractor */
  EXTRACTOR:
    `${DOCAI_BASE_URL}/projects/65970295651/locations/asia-southeast1/processors/86a3e4af9c5bba38:process`,
} as const;

/** Raw shape returned by the Document AI Process API */
export interface RawDocumentAiResponse {
  readonly document: {
    readonly mimeType?: string;
    readonly text?: string;
    readonly entities?: RawDocumentAiEntity[];
    readonly pages?: unknown[];
  };
  readonly humanReviewStatus?: unknown;
}

export interface RawDocumentAiEntity {
  readonly type?: string;
  readonly mentionText?: string;
  readonly confidence?: number;
  readonly normalizedValue?: { readonly text?: string };
  readonly textAnchor?: unknown;
}

/** Obtain a short-lived OAuth2 Bearer token from the Admin SDK credential */
async function getAccessToken(): Promise<string> {
  const credential = getApp().options.credential;
  if (!credential) {
    throw new Error("document-ai.client: No Firebase Admin credential found");
  }
  const token = await credential.getAccessToken();
  return token.access_token;
}

/**
 * Build the Document AI API request body from a document URI and MIME type.
 * - `gs://...` → `gcsDocument` field
 * - `data:...;base64,...` → `rawDocument` field (base64 content extracted)
 */
function buildRequestBody(
  documentUri: string,
  mimeType: string
): Record<string, unknown> {
  if (documentUri.startsWith("gs://")) {
    return {
      gcsDocument: { gcsUri: documentUri, mimeType },
    };
  }

  // Extract base64 payload from data URI: `data:<mime>;base64,<payload>`
  const base64Separator = ";base64,";
  const separatorIndex = documentUri.indexOf(base64Separator);
  if (!documentUri.startsWith("data:") || separatorIndex === -1) {
    throw new Error(
      "document-ai.client: documentUri must be a gs:// URI or a base64 data URI"
    );
  }

  const content = documentUri.slice(separatorIndex + base64Separator.length);

  return {
    rawDocument: { content, mimeType },
  };
}

/**
 * Call the Document AI Process API endpoint.
 *
 * @param processorUrl - Full processor endpoint URL (use `PROCESSOR_URLS` constants)
 * @param documentUri  - GCS URI or base64 data URI
 * @param mimeType     - Document MIME type
 * @returns Raw Document AI API response
 */
export async function callDocumentAi(
  processorUrl: string,
  documentUri: string,
  mimeType: string
): Promise<RawDocumentAiResponse> {
  const [accessToken, body] = await Promise.all([
    getAccessToken(),
    Promise.resolve(buildRequestBody(documentUri, mimeType)),
  ]);

  const response = await fetch(processorUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `document-ai.client: API error ${response.status} — ${errorText}`
    );
  }

  return response.json() as Promise<RawDocumentAiResponse>;
}
