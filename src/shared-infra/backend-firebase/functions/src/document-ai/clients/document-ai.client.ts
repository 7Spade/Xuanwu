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

interface DocumentAiConfig {
  readonly projectNumber: string;
  readonly location: string;
  readonly classifierProcessorId: string;
  readonly extractorProcessorId: string;
  readonly timeoutMs: number;
}

const DEFAULT_CONFIG: DocumentAiConfig = {
  projectNumber: "65970295651",
  location: "asia-southeast1",
  classifierProcessorId: "94f84cf3b653b085",
  extractorProcessorId: "86a3e4af9c5bba38",
  timeoutMs: 45_000,
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function getDocumentAiConfig(): DocumentAiConfig {
  return {
    projectNumber:
      process.env.DOCAI_PROJECT_NUMBER ?? DEFAULT_CONFIG.projectNumber,
    location: process.env.DOCAI_LOCATION ?? DEFAULT_CONFIG.location,
    classifierProcessorId:
      process.env.DOCAI_CLASSIFIER_PROCESSOR_ID ??
      DEFAULT_CONFIG.classifierProcessorId,
    extractorProcessorId:
      process.env.DOCAI_EXTRACTOR_PROCESSOR_ID ??
      DEFAULT_CONFIG.extractorProcessorId,
    timeoutMs: parsePositiveInt(
      process.env.DOCAI_HTTP_TIMEOUT_MS,
      DEFAULT_CONFIG.timeoutMs
    ),
  };
}

const DOCAI_CONFIG = getDocumentAiConfig();
const DOCAI_BASE_URL = `https://${DOCAI_CONFIG.location}-documentai.googleapis.com/v1`;

/** Processor endpoint constants */
export const PROCESSOR_URLS = {
  /** Document OCR Classifier */
  CLASSIFIER:
    `${DOCAI_BASE_URL}/projects/${DOCAI_CONFIG.projectNumber}/locations/${DOCAI_CONFIG.location}/processors/${DOCAI_CONFIG.classifierProcessorId}:process`,
  /** Document OCR Extractor */
  EXTRACTOR:
    `${DOCAI_BASE_URL}/projects/${DOCAI_CONFIG.projectNumber}/locations/${DOCAI_CONFIG.location}/processors/${DOCAI_CONFIG.extractorProcessorId}:process`,
} as const;

interface UpstreamErrorPayload {
  readonly error?: {
    readonly code?: number;
    readonly message?: string;
    readonly status?: string;
  };
}

export class DocumentAiApiError extends Error {
  readonly status: number;
  readonly upstreamStatus?: string;
  readonly upstreamCode?: number;
  readonly retryable: boolean;

  constructor(params: {
    message: string;
    status: number;
    upstreamStatus?: string;
    upstreamCode?: number;
  }) {
    super(params.message);
    this.name = "DocumentAiApiError";
    this.status = params.status;
    this.upstreamStatus = params.upstreamStatus;
    this.upstreamCode = params.upstreamCode;
    this.retryable = isRetryableStatus(params.status, params.upstreamStatus);
  }
}

function isRetryableStatus(status: number, upstreamStatus?: string): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    upstreamStatus === "RESOURCE_EXHAUSTED"
  );
}

function parseUpstreamErrorPayload(rawText: string): UpstreamErrorPayload {
  try {
    return JSON.parse(rawText) as UpstreamErrorPayload;
  } catch {
    return {};
  }
}

function createTimeoutController(): {
  readonly controller: AbortController;
  readonly cleanup: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOCAI_CONFIG.timeoutMs);
  return {
    controller,
    cleanup: () => clearTimeout(timer),
  };
}

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

  const { controller, cleanup } = createTimeoutController();
  try {
    const response = await fetch(processorUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.ok) {
      return response.json() as Promise<RawDocumentAiResponse>;
    }

    const errorText = await response.text();
    const parsed = parseUpstreamErrorPayload(errorText);
    throw new DocumentAiApiError({
      message:
        parsed.error?.message ??
        `document-ai.client: API error ${response.status}`,
      status: response.status,
      upstreamStatus: parsed.error?.status,
      upstreamCode: parsed.error?.code,
    });
  } catch (error) {
    const isAbortError =
      error instanceof DOMException && error.name === "AbortError";

    if (isAbortError) {
      throw new DocumentAiApiError({
        message: `document-ai.client: request timed out after ${DOCAI_CONFIG.timeoutMs}ms`,
        status: 504,
        upstreamStatus: "DEADLINE_EXCEEDED",
      });
    }

    if (error instanceof DocumentAiApiError) {
      throw error;
    }

    throw new DocumentAiApiError({
      message: `document-ai.client: network failure - ${String(error)}`,
      status: 503,
      upstreamStatus: "UNAVAILABLE",
    });
  } finally {
    cleanup();
  }
}
