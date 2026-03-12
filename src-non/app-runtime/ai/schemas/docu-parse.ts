import { z } from 'genkit';

/**
 * Module: docu-parse.ts
 * Purpose: 定義文件解析 AI 流程的輸入輸出契約
 * Responsibilities: ParsedWorkItem schema、提取流程 input/output schema
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * @fileOverview This file defines the Zod schemas and TypeScript types for the document parsing AI flow.
 */

export const ParsedWorkItemSchema = z.object({
  item: z.string().describe('The description of the work item.'),
  quantity: z.number().describe('The quantity of the work item.'),
  unitPrice: z.number().describe('The unit price of the work item.'),
  discount: z.number().describe('The discount for the work item.').optional(),
  price: z
    .number()
    .describe(
      "The final total price for the work item after discount (小計)."
    ),
  semanticTagSlug: z
    .string()
    .describe('Semantic tag slug matched from semantic-graph for this line item.'),
  sourceIntentIndex: z
    .number()
    .describe('0-based index of the source parsing intent line item.'),
});
export const WorkItemSchema = ParsedWorkItemSchema;
export type WorkItem = z.infer<typeof ParsedWorkItemSchema>;

export const OcrDocumentEntitySchema = z.object({
  type: z.string().describe('Entity type recognized by Document OCR Extractor.'),
  mentionText: z.string().describe('Raw text span for this entity.'),
  confidence: z.number().describe('Confidence score between 0 and 1.'),
  normalizedValue: z
    .string()
    .describe('Normalized canonical value for the entity when available.')
    .optional(),
});

export const OcrDocumentObjectSchema = z.object({
  source: z
    .literal('document-ocr-extractor')
    .describe('Pipeline source marker indicating OCR extractor output.'),
  mimeType: z.string().describe('Original MIME type of the uploaded document.'),
  text: z.string().describe('Full OCR text from Document OCR Extractor.'),
  entities: z
    .array(OcrDocumentEntitySchema)
    .describe('Structured entity extraction from Document OCR Extractor.'),
  traceId: z.string().describe('Trace ID propagated from OCR processing.'),
  extractedAt: z
    .string()
    .describe('ISO timestamp when the OCR document object was produced.'),
});

export const ExtractInvoiceItemsInputSchema = z.object({
  documentObject: OcrDocumentObjectSchema.describe(
    'Structured Document Object produced by the Document OCR Extractor before AI parsing.'
  ),
});

export const ExtractInvoiceItemsOutputSchema = z.object({
  workItems: z
    .array(ParsedWorkItemSchema)
    .describe('A list of extracted work items.'),
});
