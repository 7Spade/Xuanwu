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
import { randomUUID } from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";

import { extractDocument } from "../processors/extract.processor.js";
import type { ProcessDocumentRequest } from "../contracts/document-ai.request.js";
import type {
  ProcessDocumentResponse,
  DocumentAiErrorResponse,
} from "../contracts/document-ai.response.js";

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

    const { documentUri, mimeType } =
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

    logger.info("PROCESS_DOCUMENT: start", {
      traceId,
      mimeType,
      structuredData: true,
    });

    try {
      const result = await extractDocument(documentUri, mimeType);

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

      const errorResp: DocumentAiErrorResponse = {
        success: false,
        error: {
          code: "PROCESS_FAILED",
          message: String(err),
        },
        traceId,
      };
      res.status(500).json(errorResp);
    }
  }
);
