---
description: "Best practices for Next.js App Router code, Server/Client boundaries, and Cache Components usage."
applyTo: "**/*.{ts,tsx,js,jsx,css}"
---

# Next.js App Router Rules

## Architecture

- MUST use App Router (`app/`) conventions for new routes.
- MUST keep Server Components as default.
- MUST add `'use client'` only for browser APIs, stateful interactivity, or event handlers.
- SHOULD keep route and layout files thin and push logic into feature modules.

## Server and Client Boundaries

- MUST isolate client-only code in explicit Client Components.
- MUST NOT use `next/dynamic(..., { ssr: false })` inside Server Components.
- MUST treat `cookies()`, `headers()`, `params`, and `searchParams` as async-capable APIs.

## Route Handlers and Actions

- MUST place Route Handlers under `app/api/**/route.ts`.
- MUST validate untrusted input at Route Handler and Server Action boundaries.
- MUST return explicit status codes and stable response shapes.
- MUST NOT call internal Route Handlers from Server Components; call shared domain modules directly.

## Caching

- SHOULD prefer Cache Components for new caching work.
- SHOULD use `cacheTag(...)` and `cacheLife(...)` with explicit intent.
- SHOULD use `revalidateTag(tag, 'max')` for SWR-style invalidation.
- SHOULD use `updateTag(...)` when read-your-writes behavior is required.

## Rendering and UX

- SHOULD use `next/image` and `next/font` for critical assets.
- SHOULD use route-level `loading.tsx` and `error.tsx` boundaries.
- SHOULD use `Suspense` for progressive rendering paths.

## Decision Quality

- MUST consult current official Next.js documentation for version-sensitive framework behavior.
