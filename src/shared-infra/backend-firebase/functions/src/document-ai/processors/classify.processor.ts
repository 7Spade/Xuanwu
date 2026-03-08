/**
 * classify.processor.ts — Document Classification Processor
 *
 * Single responsibility: call the Document OCR Classifier processor and
 * return the document type with its confidence score.
 *
 * Processor: Document OCR Classifier (94f84cf3b653b085)
 * Region:    asia-southeast1
 */

import {
  callDocumentAi,
  PROCESSOR_URLS,
} from "../clients/document-ai.client.js";

export interface ClassificationResult {
  /** Predicted document type (e.g. `invoice`, `receipt`, `contract`) */
  readonly docType: string;
  /** Confidence score between 0 and 1 */
  readonly confidence: number;
}

/**
 * Classify the document type using the OCR Classifier processor.
 *
 * The classifier returns entities of type matching the document class.
 * The highest-confidence entity is selected as the classification result.
 */
export async function classifyDocument(
  documentUri: string,
  mimeType: string
): Promise<ClassificationResult> {
  const response = await callDocumentAi(
    PROCESSOR_URLS.CLASSIFIER,
    documentUri,
    mimeType
  );

  const entities = response.document?.entities ?? [];

  // Pick the entity with the highest confidence as the document class
  const best = entities.reduce<{ type: string; confidence: number } | null>(
    (acc, entity) => {
      const confidence = entity.confidence ?? 0;
      if (!acc || confidence > acc.confidence) {
        return { type: entity.type ?? "unknown", confidence };
      }
      return acc;
    },
    null
  );

  return {
    docType: best?.type ?? "unknown",
    confidence: best?.confidence ?? 0,
  };
}
