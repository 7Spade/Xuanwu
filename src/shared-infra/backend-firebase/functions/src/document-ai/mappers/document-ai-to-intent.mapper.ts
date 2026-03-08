/**
 * document-ai-to-intent.mapper.ts — Document AI → Domain Intent Mapper
 *
 * Single responsibility: map raw classification and extraction results
 * into a structured DocumentParsingIntent that domain consumers can use.
 *
 * This mapper is pure (no I/O, no side effects).
 */

import type { ClassificationResult } from "../processors/classify.processor.js";
import type { ExtractionResult } from "../processors/extract.processor.js";
import type { DocumentEntity } from "../contracts/document-ai.response.js";

/** Domain intent produced by the Document AI pipeline */
export interface DocumentParsingIntent {
  /** Classified document type (e.g. `invoice`, `receipt`, `contract`) */
  readonly docType: string;
  /** Classifier confidence score between 0 and 1 */
  readonly classifyConfidence: number;
  /** Full plain text from OCR */
  readonly rawText: string;
  /** Structured entities extracted by the extractor processor */
  readonly entities: DocumentEntity[];
  /** ISO-8601 timestamp of when the intent was created */
  readonly parsedAt: string;
}

/**
 * Build a DocumentParsingIntent from classifier + extractor results.
 *
 * @param classification - Output of classify.processor
 * @param extraction     - Output of extract.processor
 * @param parsedAt       - ISO-8601 timestamp (defaults to now; injectable for testing)
 */
export function mapToDocumentParsingIntent(
  classification: ClassificationResult,
  extraction: ExtractionResult,
  parsedAt = new Date().toISOString()
): DocumentParsingIntent {
  return {
    docType: classification.docType,
    classifyConfidence: classification.confidence,
    rawText: extraction.text,
    entities: extraction.entities,
    parsedAt,
  };
}

/**
 * Build a minimal DocumentParsingIntent from extraction only
 * (used when the classify step is skipped).
 *
 * @param extraction - Output of extract.processor
 * @param docType    - Document type label (defaults to "unknown")
 * @param parsedAt   - ISO-8601 timestamp (defaults to now; injectable for testing)
 */
export function mapExtractionToIntent(
  extraction: ExtractionResult,
  docType = "unknown",
  parsedAt = new Date().toISOString()
): DocumentParsingIntent {
  return {
    docType,
    classifyConfidence: 0,
    rawText: extraction.text,
    entities: extraction.entities,
    parsedAt,
  };
}
