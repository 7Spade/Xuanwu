/**
 * classify-document.fn.ts — Document Classification Firebase Function
 *
 * Region: asia-southeast1 (Document AI processors are in asia-southeast1)
 *
 * POST /classifyDocument
 * Body: ClassifyDocumentRequest
 * Response: ClassifyDocumentResponse | DocumentAiErrorResponse
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { randomUUID } from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";

import { classifyDocument } from "../processors/classify.processor.js";
import type { ClassifyDocumentRequest } from "../contracts/document-ai.request.js";
import type {
  ClassifyDocumentResponse,
  DocumentAiErrorResponse,
} from "../contracts/document-ai.response.js";

if (getApps().length === 0) {
  initializeApp();
}

/**
 * classifyDocument — identify the document type using the OCR Classifier.
 *
 * Accepts a GCS URI (`gs://...`) or a base64 data URI as `documentUri`.
 */
export const classifyDocumentFn = onRequest(
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
      (req.body as Partial<ClassifyDocumentRequest>).traceId ||
      randomUUID();

    const { documentUri, mimeType } =
      req.body as Partial<ClassifyDocumentRequest>;

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

    logger.info("CLASSIFY_DOCUMENT: start", {
      traceId,
      mimeType,
      structuredData: true,
    });

    try {
      const result = await classifyDocument(documentUri, mimeType);

      logger.info("CLASSIFY_DOCUMENT: completed", {
        traceId,
        docType: result.docType,
        confidence: result.confidence,
        structuredData: true,
      });

      const response: ClassifyDocumentResponse = {
        success: true,
        docType: result.docType,
        confidence: result.confidence,
        traceId,
      };
      res.status(200).json(response);
    } catch (err) {
      logger.error("CLASSIFY_DOCUMENT: failed", {
        traceId,
        error: String(err),
        structuredData: true,
      });

      const errorResp: DocumentAiErrorResponse = {
        success: false,
        error: {
          code: "CLASSIFY_FAILED",
          message: String(err),
        },
        traceId,
      };
      res.status(500).json(errorResp);
    }
  }
);
