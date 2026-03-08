---
description: "Best practices for building Next.js (App Router) apps with modern caching, tooling, and server/client boundaries (aligned with Next.js 16.1.1)."
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js, **/*.css'
---

# Next.js App Router Rules (Next.js 16.1.1)

Apply these rules to Next.js code.

## Architecture Rules

- MUST use App Router patterns (`app/`) for new routes and features.
- MUST keep Server Components as default; add `'use client'` only for interactivity or browser APIs.
- MUST keep route/layout files thin and move feature logic into feature modules.

## Server/Client Boundary Rules

- MUST NOT use `next/dynamic` with `{ ssr: false }` inside Server Components.
- MUST isolate client-only code into dedicated Client Components and import them from Server Components.
- MUST treat `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` as async-capable in Next.js 16 contexts.

## Data and Route Handler Rules

- MUST place Route Handlers under `app/api/**/route.ts` and validate all input.
- MUST return explicit status codes and stable response shapes.
- MUST NOT call own Route Handlers from Server Components for internal reuse; call shared modules directly.

## Caching Rules (Cache Components)

- SHOULD prefer Cache Components with `cacheComponents: true` and `use cache` for new caching work.
- SHOULD use `cacheTag(...)` and `cacheLife(...)` intentionally.
- SHOULD prefer `revalidateTag(tag, 'max')`; treat `revalidateTag(tag)` single-arg form as legacy.
- SHOULD use `updateTag(...)` in Server Actions when immediate read-your-writes is required.

## Performance and Security Rules

- MUST keep most logic server-side to reduce client bundle size.
- SHOULD use `next/image`, `next/font`, `Suspense`, and route-level loading/error boundaries.
- MUST enforce server-side authorization in Server Actions and Route Handlers.
- MUST handle secrets with environment variables; NEVER commit secrets.

## Tooling and Quality Rules

- MUST use TypeScript and project lint/test standards.
- SHOULD use ESLint CLI in Next.js 16 workflows.
- SHOULD use `typedRoutes` when TypeScript routing safety is needed.

## Documentation Rules

- MUST consult current official Next.js docs before non-trivial framework decisions.
- MUST avoid creating demo/example files unless user explicitly requests them.
