---
name: next-best-practices
description: 'Next.js App Router best practices for file conventions, RSC/Client boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, and bundling. Automatically loaded when working on Next.js code. Triggers: "nextjs", "app router", "server component", "route handler", "next/image", "metadata".'
user-invocable: false
---

# Next Best Practices

## Consolidation Status
- Canonical Next.js skill family entrypoint.
- Consolidated and removed wrappers: `next-cache-components`, `next-upgrade`.

## Reference Files

This skill provides authoritative guidance for the following areas. Load the relevant reference when working on that topic:

| Topic | Reference |
|-------|-----------|
| File conventions (`layout`, `page`, `loading`, `error`, `route`) | [file-conventions.md](./file-conventions.md) |
| RSC and Client Component boundaries | [rsc-boundaries.md](./rsc-boundaries.md) |
| Directives (`"use client"`, `"use server"`, `"use cache"`) | [directives.md](./directives.md) |
| Data fetching patterns | [data-patterns.md](./data-patterns.md) |
| Async APIs (params, searchParams, cookies, headers) | [async-patterns.md](./async-patterns.md) |
| Metadata and `<head>` management | [metadata.md](./metadata.md) |
| Error handling (`error.tsx`, `global-error.tsx`) | [error-handling.md](./error-handling.md) |
| Route handlers | [route-handlers.md](./route-handlers.md) |
| Image optimization (`next/image`) | [image.md](./image.md) |
| Font optimization (`next/font`) | [font.md](./font.md) |
| Suspense boundaries | [suspense-boundaries.md](./suspense-boundaries.md) |
| Hydration errors | [hydration-error.md](./hydration-error.md) |
| Bundling and tree-shaking | [bundling.md](./bundling.md) |
| Runtime selection (Node.js vs Edge) | [runtime-selection.md](./runtime-selection.md) |
| Script loading (`next/script`) | [scripts.md](./scripts.md) |
| Self-hosting | [self-hosting.md](./self-hosting.md) |
| Parallel routes and slots | [parallel-routes.md](./parallel-routes.md) |
| Built-in functions | [functions.md](./functions.md) |
| Debug tips | [debug-tricks.md](./debug-tricks.md) |

## Core Rules

- Default to Server Components; add `"use client"` only for browser APIs, event handlers, or stateful interactivity.
- Treat `params`, `searchParams`, `cookies()`, and `headers()` as async — always `await` them.
- Place Route Handlers under `app/api/**/route.ts`; never call them from Server Components.
- Use `next/image` for all `<img>` tags and `next/font` for typefaces.
- Use route-level `loading.tsx` and `error.tsx` for streaming and error boundaries.
- Consult the relevant reference file above before implementing any Next.js feature.

## Guardrails
- Do not use `next/dynamic(..., { ssr: false })` inside Server Components.
- Do not hardcode cache options (`cache: 'force-cache'`) when `"use cache"` is available.
- Flag version-sensitive behavior and check the current Next.js docs before implementing.

## Source of Truth
- Next.js App Router docs: https://nextjs.org/docs/app
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
