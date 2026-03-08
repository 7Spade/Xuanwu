/**
 * document-ai.request.ts — Document AI Function Request Contracts
 *
 * Input shapes for classify-document and process-document handlers.
 * Supports both Cloud Storage URIs and inline base64 data URIs.
 */

/** Common document source: GCS URI or base64 data URI */
export interface DocumentSource {
  /** Firebase Storage / GCS URI: `gs://bucket/path/file.pdf`
   *  or data URI: `data:application/pdf;base64,<encoded>` */
  readonly documentUri: string;
  /** MIME type of the document (e.g. `application/pdf`, `image/jpeg`) */
  readonly mimeType: string;
}

/** Request body for classify-document handler */
export interface ClassifyDocumentRequest extends DocumentSource {
  /** [R8] Optional caller-injected traceId; generated if absent */
  readonly traceId?: string;
}

/** Request body for process-document handler (OCR + entity extraction) */
export interface ProcessDocumentRequest extends DocumentSource {
  /** [R8] Optional caller-injected traceId; generated if absent */
  readonly traceId?: string;
}
