/**
 * Upstash Workflow — durable serverless workflow helper for Next.js.
 *
 * Re-exports `serve` from `@upstash/workflow/nextjs` so Route Handlers can
 * declare multi-step durable workflows that survive cold-starts, retries,
 * and failures without managing any infrastructure.
 *
 * Environment requirements:
 *   QSTASH_TOKEN   — required by the Workflow SDK for internal step delivery
 *   QSTASH_URL     — base QStash URL (auto-resolved when using Upstash console)
 *
 * Usage — declare a workflow Route Handler:
 *   // app/api/workflows/process-document/route.ts
 *   import { serve } from "@/infrastructure/upstash/workflow";
 *
 *   export const { POST } = serve<{ fileId: string }>(async (context) => {
 *     const { fileId } = context.requestPayload;
 *
 *     const ocrResult = await context.run("ocr", async () => {
 *       return await callDocumentAI(fileId);
 *     });
 *
 *     await context.run("extract", async () => {
 *       await extractInvoiceItems({ ocrResult });
 *     });
 *   });
 *
 * Usage — trigger a workflow from a Server Action:
 *   import { workflowClient } from "@/infrastructure/upstash/workflow";
 *   await workflowClient.trigger({
 *     url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/workflows/process-document`,
 *     body: { fileId: "abc123" },
 *   });
 */

import "server-only";

export { serve } from "@upstash/workflow/nextjs";

export { Client as WorkflowClient } from "@upstash/workflow";

import { Client as _WorkflowClient } from "@upstash/workflow";

/** Singleton Workflow management client for triggering / cancelling workflows. */
export const workflowClient = new _WorkflowClient({
  token: process.env.QSTASH_TOKEN!,
});
