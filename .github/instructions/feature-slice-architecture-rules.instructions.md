---
name: "Feature Slice Architecture Rules"
description: "Feature-Sliced Design rules covering dependency flow, barrel files, Server/Client boundaries, state, validation, adapters, error handling, performance, testing, naming, and documentation."
applyTo: "**/*.{ts,tsx,js,jsx,md}"
---

# Feature Slice Architecture Rules

## 📦 Dependency Management

- MUST enforce unidirectional dependency flow: `app/` → `features/` → shared layers only; reverse imports are forbidden.
- MUST NOT import internal files from `features/A` directly into `features/B`; cross-feature references MUST go through `B/index.ts`.
- MUST extract shared logic to `shared/` or global `components/` when cross-feature coupling exceeds two features.
- MUST use `eslint-plugin-import` `no-restricted-paths` to automatically enforce dependency boundaries.
- MUST apply Occam's Razor: prefer the simplest structure that satisfies requirements.
- MUST keep single responsibility per module; one file, one clear purpose.

## 🔒 Public API (Barrel Files)

- MUST provide an `index.ts` barrel file at the root of every Feature folder.
- MUST export only the public API from `index.ts`; internal implementation details (sub-components, helpers) MUST NOT be re-exported.
- MUST NOT change `index.ts` exports in a way that forces updates in external pages; keep the public contract stable.

## ⚡ Server / Client Boundary

- MUST keep data fetching in Server Components by default; move to Client only when browser APIs or interactivity are required.
- MUST place all Server-side data fetching operations in `queries.ts` and Server Actions in `actions.ts` within each feature.
- MUST name Client Components with the `XXXClient.tsx` suffix.
- MUST name pure rendering (presentational) components as `XXX.tsx` (no `Client` suffix).

## 🧩 State Management

- MUST keep feature-internal state in local Context or local Store; do not promote to global state.
- MUST place only truly cross-feature data (auth session, global theme) in `src/stores`.
- SHOULD NOT share ephemeral UI state across feature boundaries.

## ✅ Validation and Types

- MUST define every feature's data structures with Zod schemas in a `schemas.ts` file; this is the single source of truth.
- MUST use the same Zod schema for both frontend forms (`react-hook-form`) and backend (Server Actions).
- MUST derive TypeScript types with `z.infer<typeof schema>` only; MUST NOT write duplicate manual type definitions.

## 🔌 External Service Encapsulation

- MUST NOT call third-party SDKs (e.g. Stripe, Firebase) directly inside UI components.
- MUST wrap every external service in an Adapter layer under `features/xxx/services/`.
- MUST limit external service replacement to the Adapter layer only; UI components MUST NOT change when swapping a vendor.

## 🛡️ Error Handling

- MUST provide a feature-local Error Boundary; do not rely solely on the global `error.tsx`.
- MUST create an `ErrorFallback.tsx` within each feature that offers precise UI recovery actions.

## 🚀 Performance

- SHOULD load heavy Features dynamically with `next/dynamic` at the `app/` page level.
- MUST treat Feature folders as natural code-splitting boundaries; do not merge unrelated features into a single bundle entry.

## 🧪 Testing

- MUST colocate test files with their source in the same feature directory (e.g. `components/Foo.test.tsx`).
- MUST delete all tests that belong to a feature when that feature is removed; do not leave orphaned test files.

## 📐 Naming and Scale Control

- MUST name Feature folders after business goals, not UI implementation details (`member-management` ✅, `user-table` ❌).
- MUST split a Feature into finer sub-features when complexity or component count (typically more than 10 components) impairs maintainability.
- MUST extract logic that spans 4–5 features to `features/shared` (for feature-like shared modules) or `lib/` (for pure utility/helper functions) rather than forcing it into a single Feature.

## 📄 Documentation

- MUST maintain architecture-level documentation in `docs/architecture.md`.
- MUST provide a `README.md` in each Feature folder describing the business boundary, dependencies, and external integrations.
- MUST update Feature `README.md` whenever its public API, dependencies, or external integrations change.
