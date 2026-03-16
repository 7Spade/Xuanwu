/**
 * Document AI — Zod schemas for the document parsing AI flow.
 *
 * Defines the structured contract between the OCR extractor (Phase 1 Cloud
 * Function) and the Genkit semantic extraction flow (Phase 2 Gemini call).
 *
 * Schema hierarchy:
 *   OcrDocumentObjectSchema  — structured OCR output from processDocument CF
 *   ExtractInvoiceItemsInputSchema — Phase 2 flow input
 *   ExtractInvoiceItemsOutputSchema — Phase 2 flow output
 *   ParsedWorkItemSchema     — a single extracted line item
 */

import { z } from "genkit";

// ---------------------------------------------------------------------------
// Parsed line item (output of Phase 2)
// ---------------------------------------------------------------------------

export const ParsedWorkItemSchema = z.object({
  description: z.string().describe("Description of the work / material item (料號/品名)."),
  quantity: z.number().describe("Quantity (數量)."),
  unitPrice: z.number().describe("Unit price (單價)."),
  discount: z.number().optional().describe("Discount amount (折扣). Defaults to 0 when absent."),
  price: z
    .number()
    .describe("Final total price for the line item after discount (小計)."),
  semanticTagSlug: z
    .string()
    .describe("Stable, slug-like semantic tag aligned with the semantic-graph taxonomy."),
  sourceIntentIndex: z
    .number()
    .describe("0-based row index from the source document for deterministic ordering."),
});

export type ParsedWorkItem = z.infer<typeof ParsedWorkItemSchema>;

// ---------------------------------------------------------------------------
// OCR entity and document object (output of Phase 1)
// ---------------------------------------------------------------------------

export const OcrDocumentEntitySchema = z.object({
  type: z.string().describe("Entity type recognized by Document AI OCR Extractor."),
  mentionText: z.string().describe("Raw text span for this entity."),
  confidence: z.number().describe("Confidence score between 0 and 1."),
  normalizedValue: z
    .string()
    .optional()
    .describe("Normalized canonical value when available."),
});

export const OcrDocumentObjectSchema = z.object({
  source: z
    .literal("document-ocr-extractor")
    .describe("Pipeline source marker indicating OCR extractor output."),
  mimeType: z.string().describe("Original MIME type of the uploaded document."),
  text: z.string().describe("Full OCR text extracted from the document."),
  entities: z
    .array(OcrDocumentEntitySchema)
    .describe("Structured entity extraction from Document AI."),
  traceId: z.string().describe("Trace ID propagated from OCR processing."),
  extractedAt: z.string().describe("ISO-8601 timestamp when the OCR was produced."),
});

export type OcrDocumentObject = z.infer<typeof OcrDocumentObjectSchema>;

// ---------------------------------------------------------------------------
// Flow I/O schemas
// ---------------------------------------------------------------------------

export const ExtractInvoiceItemsInputSchema = z.object({
  documentObject: OcrDocumentObjectSchema.describe(
    "Structured OCR Document Object produced by the processDocument Cloud Function.",
  ),
});

export const ExtractInvoiceItemsOutputSchema = z.object({
  workItems: z.array(ParsedWorkItemSchema).describe("All extracted line items."),
});

export type ExtractInvoiceItemsInput = z.infer<typeof ExtractInvoiceItemsInputSchema>;
export type ExtractInvoiceItemsOutput = z.infer<typeof ExtractInvoiceItemsOutputSchema>;
