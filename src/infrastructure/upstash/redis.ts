/**
 * Upstash Redis — singleton client.
 *
 * HTTP/REST-based Redis client optimised for serverless and edge runtimes
 * (no persistent TCP connections).  Safe to import from Server Components,
 * Server Actions, Route Handlers, and Cloud Functions.
 *
 * Environment requirements:
 *   UPSTASH_REDIS_REST_URL   — REST endpoint (e.g. https://...upstash.io)
 *   UPSTASH_REDIS_REST_TOKEN — bearer token
 *
 * Usage:
 *   import { redis } from "@/infrastructure/upstash/redis";
 *   await redis.set("key", "value");
 *   const value = await redis.get<string>("key");
 */

import "server-only";

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
