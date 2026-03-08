/**
 * process-document.fn.ts — Document Processing Firebase Function
 *
 * Region: asia-southeast1 (Document AI processors are in asia-southeast1)
 *
 * POST /processDocument
 * Body: ProcessDocumentRequest
 * Response: ProcessDocumentResponse | DocumentAiErrorResponse
 *
 * Pipeline: OCR Extractor → entity extraction → response
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { createHash, randomUUID } from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

import { DocumentAiApiError } from "../clients/document-ai.client.js";
import { extractDocument } from "../processors/extract.processor.js";
import type { ProcessDocumentRequest } from "../contracts/document-ai.request.js";
import type {
  ProcessDocumentResponse,
  DocumentAiErrorResponse,
} from "../contracts/document-ai.response.js";

function mapUpstreamStatusToHttpStatus(error: DocumentAiApiError): number {
  if (error.status === 429 || error.upstreamStatus === "RESOURCE_EXHAUSTED") {
    return 429;
  }
  if (error.status === 400) {
    return 400;
  }
  if (error.status === 401 || error.status === 403) {
    return 502;
  }
  if (error.status === 408 || error.status === 504) {
    return 504;
  }
  return 502;
}

function mapUpstreamStatusToCode(error: DocumentAiApiError): string {
  if (error.status === 429 || error.upstreamStatus === "RESOURCE_EXHAUSTED") {
    return "RESOURCE_EXHAUSTED";
  }
  if (error.status === 400) {
    return "UPSTREAM_INVALID_ARGUMENT";
  }
  if (error.status === 408 || error.status === 504) {
    return "UPSTREAM_TIMEOUT";
  }
  return "UPSTREAM_SERVICE_ERROR";
}

const RECENT_REQUEST_WINDOW_MS = 30_000;
const recentRequestAtByKey = new Map<string, number>();

function buildRequestDedupeKey(documentUri: string, mimeType: string): string {
  const fingerprint = createHash("sha256")
    .update(`${mimeType}::${documentUri}`)
    .digest("hex");
  return `${mimeType}:${fingerprint}`;
}

function isLikelyDuplicateRequest(requestKey: string): boolean {
  const now = Date.now();
  for (const [key, seenAt] of recentRequestAtByKey.entries()) {
    if (now - seenAt > RECENT_REQUEST_WINDOW_MS) {
      recentRequestAtByKey.delete(key);
    }
  }

  const lastSeenAt = recentRequestAtByKey.get(requestKey);
  recentRequestAtByKey.set(requestKey, now);

  if (!lastSeenAt) {
    return false;
  }
  return now - lastSeenAt < RECENT_REQUEST_WINDOW_MS;
}

async function persistOcrStatus(params: {
  sourceRef?: ProcessDocumentRequest["sourceRef"];
  traceId: string;
  status: "success" | "failed";
  mimeType: string;
  errorCode?: string;
  errorMessage?: string;
  textLength?: number;
  entityCount?: number;
}): Promise<void> {
  const sourceRef = params.sourceRef;
  if (!sourceRef?.workspaceId || !sourceRef.fileId) {
    return;
  }

  const db = getFirestore();
  await db
    .collection("workspaces")
    .doc(sourceRef.workspaceId)
    .collection("files")
    .doc(sourceRef.fileId)
    .set(
      {
        ocrExtraction: {
          status: params.status,
          traceId: params.traceId,
          mimeType: params.mimeType,
          ...(params.errorCode ? { errorCode: params.errorCode } : {}),
          ...(params.errorMessage ? { errorMessage: params.errorMessage } : {}),
          ...(typeof params.textLength === "number"
            ? { textLength: params.textLength }
            : {}),
          ...(typeof params.entityCount === "number"
            ? { entityCount: params.entityCount }
            : {}),
          processedAt: Timestamp.now(),
        },
      },
      { merge: true }
    );
}

if (getApps().length === 0) {
  initializeApp();
}

/**
 * processDocument — perform OCR and entity extraction using the OCR Extractor.
 *
 * Accepts a GCS URI (`gs://...`) or a base64 data URI as `documentUri`.
 */
export const processDocumentFn = onRequest(
  { region: "asia-southeast1", maxInstances: 10 },
  async (req, res) => {
    if (req.method !== "POST") {
      const errorResp: DocumentAiErrorResponse = {
        success: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Method Not Allowed" },
      };
      res.status(405).json(errorResp);
      return;
    }

    // [R8] Accept caller-supplied traceId or generate one
    const traceId: string =
      (req.headers["x-trace-id"] as string) ||
      (req.body as Partial<ProcessDocumentRequest>).traceId ||
      randomUUID();

    const { documentUri, mimeType, sourceRef } =
      req.body as Partial<ProcessDocumentRequest>;

    if (!documentUri || !mimeType) {
      const errorResp: DocumentAiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "documentUri and mimeType are required",
        },
        traceId,
      };
      res.status(400).json(errorResp);
      return;
    }

    const dedupeKey = buildRequestDedupeKey(documentUri, mimeType);
    const duplicateInWindow = isLikelyDuplicateRequest(dedupeKey);

    logger.info("PROCESS_DOCUMENT: start", {
      traceId,
      mimeType,
      duplicateInWindow,
      structuredData: true,
    });

    if (duplicateInWindow) {
      const duplicateErrorResp: DocumentAiErrorResponse = {
        success: false,
        error: {
          code: "REQUEST_COOLDOWN_ACTIVE",
          message:
            "A similar OCR request is already running or was just processed. Please retry shortly.",
        },
        traceId,
      };
      res.set("Retry-After", "30");
      res.status(429).json(duplicateErrorResp);
      return;
    }

    try {
      const result = await extractDocument(documentUri, mimeType);

      await persistOcrStatus({
        sourceRef,
        traceId,
        status: "success",
        mimeType,
        textLength: result.text.length,
        entityCount: result.entities.length,
      });

      logger.info("PROCESS_DOCUMENT: completed", {
        traceId,
        textLength: result.text.length,
        entityCount: result.entities.length,
        structuredData: true,
      });

      const response: ProcessDocumentResponse = {
        success: true,
        text: result.text,
        entities: result.entities,
        traceId,
      };
      res.status(200).json(response);
    } catch (err) {
      logger.error("PROCESS_DOCUMENT: failed", {
        traceId,
        error: String(err),
        structuredData: true,
      });

      if (err instanceof DocumentAiApiError) {
        const status = mapUpstreamStatusToHttpStatus(err);
        const code = mapUpstreamStatusToCode(err);

        await persistOcrStatus({
          sourceRef,
          traceId,
          status: "failed",
          mimeType,
          errorCode: code,
          errorMessage: err.message,
        });

        if (status === 429) {
          res.set("Retry-After", "60");
        }

        const upstreamErrorResp: DocumentAiErrorResponse = {
          success: false,
          error: {
            code,
            message: err.message,
          },
          traceId,
        };
        res.status(status).json(upstreamErrorResp);
        return;
      }

      const errorResp: DocumentAiErrorResponse = {
        success: false,
        error: {
          code: "PROCESS_FAILED",
          message: String(err),
        },
        traceId,
      };
      await persistOcrStatus({
        sourceRef,
        traceId,
        status: "failed",
        mimeType,
        errorCode: "PROCESS_FAILED",
        errorMessage: String(err),
      });
      res.status(500).json(errorResp);
    }
  }
);
