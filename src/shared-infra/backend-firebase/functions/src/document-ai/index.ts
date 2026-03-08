/**
 * index.ts — Document AI module public exports
 *
 * Re-exports:
 *   - Firebase Function handlers (classifyDocumentFn, processDocumentFn)
 *   - Contracts (request / response types)
 *   - Mapper (mapToDocumentParsingIntent, mapExtractionToIntent)
 *   - DocumentParsingIntent domain type
 */

// Handlers (Firebase Functions)
export { classifyDocumentFn } from "./handlers/classify-document.fn.js";
export { processDocumentFn }  from "./handlers/process-document.fn.js";

// Contracts
export type { ClassifyDocumentRequest, ProcessDocumentRequest } from "./contracts/document-ai.request.js";
export type {
  ClassifyDocumentResponse,
  ProcessDocumentResponse,
  DocumentAiErrorResponse,
  DocumentEntity,
} from "./contracts/document-ai.response.js";

// Domain intent
export type { DocumentParsingIntent } from "./mappers/document-ai-to-intent.mapper.js";
export {
  mapToDocumentParsingIntent,
  mapExtractionToIntent,
} from "./mappers/document-ai-to-intent.mapper.js";
