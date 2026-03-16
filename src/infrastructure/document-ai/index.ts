/**
 * Document AI infrastructure — public barrel.
 *
 * Exports the Genkit AI flows and schemas needed by application-layer
 * use cases.  Do not import this from Client Components.
 */

export { extractInvoiceItems } from "./flows/extract-invoice-items";

export type {
  ParsedWorkItem,
  OcrDocumentObject,
  ExtractInvoiceItemsInput,
  ExtractInvoiceItemsOutput,
} from "./schemas/docu-parse";

export {
  ParsedWorkItemSchema,
  OcrDocumentObjectSchema,
  ExtractInvoiceItemsInputSchema,
  ExtractInvoiceItemsOutputSchema,
} from "./schemas/docu-parse";
