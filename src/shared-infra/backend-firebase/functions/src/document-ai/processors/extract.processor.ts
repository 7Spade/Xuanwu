/**
 * extract.processor.ts — Document Entity Extraction Processor
 *
 * Single responsibility: call the Document OCR Extractor processor and
 * return structured entities alongside the full extracted text.
 *
 * Processor: Document OCR Extractor (86a3e4af9c5bba38)
 * Region:    asia-southeast1
 */

import {
  callDocumentAi,
  PROCESSOR_URLS,
} from "../clients/document-ai.client.js";
import { extractOcrText } from "./ocr.processor.js";
import type { DocumentEntity } from "../contracts/document-ai.response.js";

export interface ExtractionResult {
  /** Full plain text of the document from OCR */
  readonly text: string;
  /** Structured entities extracted from the document */
  readonly entities: DocumentEntity[];
}

/**
 * Extract text and named entities from the document using the OCR Extractor.
 */
export async function extractDocument(
  documentUri: string,
  mimeType: string
): Promise<ExtractionResult> {
  const response = await callDocumentAi(
    PROCESSOR_URLS.EXTRACTOR,
    documentUri,
    mimeType
  );

  const text = extractOcrText(response);

  const entities: DocumentEntity[] = (response.document?.entities ?? []).map(
    (raw) => ({
      type: raw.type ?? "unknown",
      mentionText: raw.mentionText ?? "",
      confidence: raw.confidence ?? 0,
      ...(raw.normalizedValue?.text !== undefined
        ? { normalizedValue: raw.normalizedValue.text }
        : {}),
    })
  );

  return { text, entities };
}
