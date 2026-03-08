'use server';
/**
 * Module: extract-invoice-items.ts
 * Purpose: 從單據中抽取結構化項目並附帶語義標籤
 * Responsibilities: 觸發 AI 抽取、語義掛載約束、回傳索引完整性保證
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * @fileOverview Extracts line items from an invoice or quote document.
 */

import { z } from 'genkit';

import { ai } from '@/app-runtime/ai/genkit';
import {
  ExtractInvoiceItemsInputSchema,
  ExtractInvoiceItemsOutputSchema,
} from '@/app-runtime/ai/schemas/docu-parse';

const ExtractInvoiceItemsPromptInputSchema = z.object({
  documentObjectJson: z
    .string()
    .describe('Structured OCR Document Object JSON serialized as a string.'),
});

export async function extractInvoiceItems(
  input: z.infer<typeof ExtractInvoiceItemsInputSchema>
): Promise<z.infer<typeof ExtractInvoiceItemsOutputSchema>> {
  return extractInvoiceItemsFlow(input);
}

const extractInvoiceItemsPrompt = ai.definePrompt({
  name: 'extractInvoiceItemsPrompt',
  input: { schema: ExtractInvoiceItemsPromptInputSchema },
  output: { schema: ExtractInvoiceItemsOutputSchema },
  prompt: `You are an expert AI assistant for parsing financial documents like quotes and invoices.

Analyze the provided structured OCR Document Object JSON and extract every single work item. For each item, extract the following:
- The item description (料號/品名).
- The quantity (數量).
- The unit price (單價).
- The discount amount (折扣).
- The final total price for the line item (小計) as the 'price' field.
- A semantic tag slug as 'semanticTagSlug' by matching the item's cost intent to the semantic graph tag taxonomy.
- The original row index as 'sourceIntentIndex' (0-based) to preserve stable ordering.

OCR Document Object JSON:
{{documentObjectJson}}
  
Follow these rules:
- The 'price' field should be the final amount after any discount.
- If a field is not explicitly present for an item, you can infer it from other fields (e.g., unitPrice = price / quantity).
- If quantity is not present, default to 1.
- If discount is not present, default to 0.
- Ensure all extracted numbers are parsed correctly, even if they contain commas.
- You must perform semantic tagging for every line item and return a non-empty 'semanticTagSlug' string.
- 'semanticTagSlug' must be stable and slug-like (lowercase, hyphen-separated), and aligned with semantic-graph tagSlug conventions.
- Always provide 'sourceIntentIndex' for each item; if uncertain, assign by row order starting from 0.
- Return a JSON object with a "workItems" array.`,
});

const extractInvoiceItemsFlow = ai.defineFlow(
  {
    name: 'extractInvoiceItemsFlow',
    inputSchema: ExtractInvoiceItemsInputSchema,
    outputSchema: ExtractInvoiceItemsOutputSchema,
  },
  async (input) => {
    const { output } = await extractInvoiceItemsPrompt({
      documentObjectJson: JSON.stringify(input.documentObject, null, 2),
    });
    if (!output) {
      throw new Error('No output from AI');
    }

    const normalizedWorkItems = output.workItems.map((item, index) => ({
      ...item,
      sourceIntentIndex:
        typeof item.sourceIntentIndex === 'number' && Number.isFinite(item.sourceIntentIndex)
          ? item.sourceIntentIndex
          : index,
    }));

    return {
      workItems: normalizedWorkItems,
    };
  }
);
