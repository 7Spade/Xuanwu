/**
 * ocr.processor.ts — OCR Text Extraction
 *
 * Single responsibility: extract plain text from a raw Document AI response.
 * Used by both classify and process pipelines as a shared utility.
 */

import type { RawDocumentAiResponse } from "../clients/document-ai.client.js";

/**
 * Extract the full plain text from a Document AI response.
 * Returns an empty string if the document has no recognised text.
 */
export function extractOcrText(response: RawDocumentAiResponse): string {
  return response.document?.text ?? "";
}
