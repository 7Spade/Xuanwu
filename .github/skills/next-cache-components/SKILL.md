---
name: next-cache-components
description: 'Next.js 16 Cache Components guide for PPR, "use cache" directive, cacheLife, cacheTag, and revalidateTag. Use when implementing server-side caching, adding cache directives to components, configuring cache lifetimes, tagging cached data, or invalidating caches. Triggers: "use cache", "cache component", "cacheLife", "cacheTag", "PPR", "partial pre-rendering".'
---

# Next Cache Components

## When to Use
- Adding `"use cache"` directive to a Server Component or async function
- Configuring cache lifetime with `cacheLife` profiles
- Tagging cached data with `cacheTag` for targeted invalidation
- Calling `revalidateTag` / `updateTag` to invalidate cache on demand
- Migrating from `fetch` cache options to the Cache Components model

## Prerequisites
- Next.js 16.0.0+ (stable or canary); beta versions are NOT supported
- `experimental.cacheComponents` enabled in `next.config` (stable in canary >16)
- Clean git working directory before starting

## Workflow
1. Verify Next.js version: `npm ls next` — must be ≥16.0.0.
2. Identify the component or data-fetch function to cache.
3. Add `"use cache"` directive at the top of the function/component.
4. Call `cacheLife(profile)` inside the function to set TTL (e.g., `"hours"`, `"days"`).
5. Call `cacheTag(tag)` to associate cache entries with invalidation keys.
6. Use `revalidateTag(tag, 'max')` for SWR-style invalidation, or `updateTag(tag)` for read-your-writes.
7. Wrap dynamic sibling content in `<Suspense>` when using PPR.
8. Build and verify: `npm run build` — check for cache boundary errors.

## Output Contract
- Produce a diff showing added directives, cacheLife calls, and cacheTag calls.
- Document which cache tags are used and what invalidation strategy applies.
- Flag any components that cannot be cached (client components, stateful code).

## Guardrails
- Never add `"use cache"` to Client Components (`"use client"` files).
- Do not cache components with user-session-specific data without `"use cache: private"`.
- Remove any conflicting `fetch` cache options (`cache: 'force-cache'`, `next.revalidate`) when migrating.

## Source of Truth
- Next.js Cache Components docs: https://nextjs.org/docs/canary/app/api-reference/directives/use-cache
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
