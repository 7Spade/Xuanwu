/**
 * Document AI — extract-invoice-items flow.
 *
 * Phase 2 of the Document Intelligence pipeline:
 *   Input:  OcrDocumentObject produced by the processDocument Cloud Function
 *   Output: ParsedWorkItem[] with semantic tags and stable row indices
 *
 * The flow uses Gemini 2.5 Flash to:
 *   - Identify every line item (料號/品名, 數量, 單價, 折扣, 小計)
 *   - Assign a slug-like semantic tag (semanticTagSlug) per item
 *   - Guarantee sourceIntentIndex ordering for deterministic materialization
 *
 * Called from:
 *   file.module/core/_use-cases.ts — submitDocumentForParsing
 */

import { z } from "genkit";

import { ai } from "@/infrastructure/document-ai/genkit";
import {
  ExtractInvoiceItemsInputSchema,
  ExtractInvoiceItemsOutputSchema,
} from "@/infrastructure/document-ai/schemas/docu-parse";

const PromptInputSchema = z.object({
  documentObjectJson: z
    .string()
    .describe("Structured OCR Document Object JSON serialized as a string."),
});

const extractInvoiceItemsPrompt = ai.definePrompt({
  name: "extractInvoiceItemsPrompt",
  input: { schema: PromptInputSchema },
  output: { schema: ExtractInvoiceItemsOutputSchema },
  prompt: `You are an expert AI assistant for parsing financial documents such as quotes and invoices.

Analyze the provided structured OCR Document Object JSON and extract every single work item.
For each item, extract:
- The item description (料號/品名) — use field name "description".
- The quantity (數量).
- The unit price (單價).
- The discount amount (折扣).
- The final total price for the line item (小計) as the 'price' field.
- A semantic tag slug as 'semanticTagSlug' (lowercase, hyphen-separated, aligned with the semantic-graph tag taxonomy).
- The original row index as 'sourceIntentIndex' (0-based) to preserve stable ordering.

OCR Document Object JSON:
{{documentObjectJson}}

Rules:
- 'price' is the final amount after any discount.
- If a field is absent, infer it where possible (e.g., unitPrice = price / quantity).
- If quantity is absent, default to 1. If discount is absent, omit the field entirely.
- Parse numbers correctly even if they contain commas.
- Always return a non-empty 'semanticTagSlug' for every item.
- Always provide 'sourceIntentIndex'; assign by row order from 0 if uncertain.
- Return a JSON object with a "workItems" array.`,
});

const extractInvoiceItemsFlow = ai.defineFlow(
  {
    name: "extractInvoiceItemsFlow",
    inputSchema: ExtractInvoiceItemsInputSchema,
    outputSchema: ExtractInvoiceItemsOutputSchema,
  },
  async (input) => {
    const { output } = await extractInvoiceItemsPrompt({
      documentObjectJson: JSON.stringify(input.documentObject, null, 2),
    });
    if (!output) {
      throw new Error("extractInvoiceItemsFlow: no output from Gemini model");
    }

    const normalizedWorkItems = output.workItems.map((item, index) => ({
      ...item,
      sourceIntentIndex:
        typeof item.sourceIntentIndex === "number" &&
        Number.isFinite(item.sourceIntentIndex)
          ? item.sourceIntentIndex
          : index,
    }));

    return { workItems: normalizedWorkItems };
  },
);

/**
 * Extracts structured work items from an OcrDocumentObject using Gemini 2.5 Flash.
 * This is the public API — call from Server Actions / Server Components only.
 */
export async function extractInvoiceItems(
  input: z.infer<typeof ExtractInvoiceItemsInputSchema>,
): Promise<z.infer<typeof ExtractInvoiceItemsOutputSchema>> {
  return extractInvoiceItemsFlow(input);
}
