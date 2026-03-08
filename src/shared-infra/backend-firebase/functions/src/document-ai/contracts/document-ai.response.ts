/**
 * document-ai.response.ts — Document AI Function Response Contracts
 *
 * Output shapes returned by classify-document and process-document handlers.
 */

/** A single extracted entity from Document AI */
export interface DocumentEntity {
  /** Entity type as recognised by the processor (e.g. `invoice_id`, `amount`) */
  readonly type: string;
  /** The raw text span that was tagged */
  readonly mentionText: string;
  /** Confidence score between 0 and 1 */
  readonly confidence: number;
  /** Normalised value string when available (dates, amounts, etc.) */
  readonly normalizedValue?: string;
}

/** Response shape for classify-document handler */
export interface ClassifyDocumentResponse {
  readonly success: true;
  /** Document class predicted by the OCR Classifier processor */
  readonly docType: string;
  /** Classifier confidence score between 0 and 1 */
  readonly confidence: number;
  /** [R8] Propagated traceId */
  readonly traceId: string;
}

/** Response shape for process-document handler */
export interface ProcessDocumentResponse {
  readonly success: true;
  /** Full extracted plain text from the document */
  readonly text: string;
  /** Structured entities extracted by the OCR Extractor processor */
  readonly entities: DocumentEntity[];
  /** [R8] Propagated traceId */
  readonly traceId: string;
}

/** Shared error response shape for both handlers */
export interface DocumentAiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
  /** [R8] Propagated traceId when available */
  readonly traceId?: string;
}
