/**
 * Upstash Vector — index client.
 *
 * HTTP/REST-based vector database client for semantic similarity search,
 * RAG pipelines, and embedding-based retrieval.  Suitable for serverless
 * and edge environments.
 *
 * Environment requirements:
 *   UPSTASH_VECTOR_REST_URL   — REST endpoint (e.g. https://...upstash.io)
 *   UPSTASH_VECTOR_REST_TOKEN — bearer token
 *
 * Metadata shape (T) can be overridden at call site:
 *   import { vectorIndex } from "@/infrastructure/upstash/vector";
 *   const idx = vectorIndex<{ title: string; module: string }>();
 *   await idx.upsert([{ id: "doc-1", vector: [...], metadata: { title: "…", module: "file" } }]);
 *   const results = await idx.query({ vector: [...], topK: 5, includeMetadata: true });
 *
 * Usage (with default metadata):
 *   import { vectorIndex } from "@/infrastructure/upstash/vector";
 *   const results = await vectorIndex().query({ vector: [...], topK: 10 });
 */

import "server-only";

import { Index } from "@upstash/vector";

/**
 * Returns a typed `Index` instance for the Upstash Vector database.
 * Pass a metadata type parameter for type-safe upsert / query operations.
 */
export function vectorIndex<Metadata extends Record<string, unknown> = Record<string, unknown>>() {
  return new Index<Metadata>({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });
}
