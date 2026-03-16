/**
 * Upstash QStash — message queue client and request receiver.
 *
 * HTTP-based messaging and scheduling for serverless / edge environments.
 * Use `qstash` to publish messages or manage schedules.
 * Use `qstashReceiver` to verify incoming QStash webhook signatures in
 * Route Handlers before processing the payload.
 *
 * Environment requirements:
 *   QSTASH_TOKEN          — publisher / management token (server-only)
 *   QSTASH_CURRENT_SIGNING_KEY — current signing key (webhook verification)
 *   QSTASH_NEXT_SIGNING_KEY    — next signing key   (webhook verification)
 *
 * Usage — publish a message:
 *   import { qstash } from "@/infrastructure/upstash/qstash";
 *   await qstash.publishJSON({
 *     url: "https://my-app.vercel.app/api/jobs/process-document",
 *     body: { fileId: "abc123" },
 *   });
 *
 * Usage — verify an incoming webhook:
 *   import { qstashReceiver } from "@/infrastructure/upstash/qstash";
 *   const isValid = await qstashReceiver.verify({
 *     signature: req.headers.get("upstash-signature") ?? "",
 *     body: await req.text(),
 *   });
 */

import "server-only";

import { Client, Receiver } from "@upstash/qstash";

/** Publisher / management client. */
export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/** Receiver used to verify incoming QStash webhook signatures. */
export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});
