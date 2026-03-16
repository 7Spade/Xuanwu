# `src/infrastructure/` Agent Rules

Purpose: keep adapters free of business logic, enforce port-interface contracts, and prevent circular dependencies between infrastructure and modules.

This file is mandatory guidance for any agent editing files under `src/infrastructure/`.

---

## 0. Non-negotiable Principles

1. Infrastructure adapters implement **port interfaces** — they never own business rules.
2. No import from `src/modules/` is allowed in this directory.
3. SDK credentials come from environment variables only — never hardcode.
4. Firebase Admin SDK and Upstash adapters are **server-only** — mark with `import "server-only"`.
5. Catch SDK errors at the adapter boundary and re-throw as typed `AppError` subclasses.

---

## 1. Dependency Direction

```
src/infrastructure/
   ↓  implements
src/shared/ports/   ← port interfaces (ICachePort, IQueuePort, IVectorIndexPort, IWorkflowPort)

src/infrastructure/ MUST NOT import from:
   src/modules/    ← modules depend on infrastructure, not the reverse
   src/app/        ← route layer depends on modules, not adapters
```

---

## 2. Boundary Gate (Run Before Any Edit)

1. Does this adapter file import from `src/modules/`? → **Stop.**
2. Does the adapter contain conditional domain logic or invariant enforcement? → Move to module domain layer.
3. Are SDK credentials read from `process.env.*`? → If hardcoded, refuse.
4. Is the file server-only? → Add `import "server-only"` if it uses Admin SDK or Upstash with write access.
5. Does the adapter correctly implement the port interface contract (same method signatures)?

---

## 3. Adding a New Adapter

Follow this sequence:

1. Identify or define the **port interface** in `src/shared/ports/` (cross-cutting) or `src/modules/<name>.module/domain.*/_ports.ts` (module-scoped).
2. Create the adapter file in `src/infrastructure/<service>/` (cross-cutting) or `src/modules/<name>.module/infra.<adapter>/` (module-scoped).
3. Implement all port interface methods with no domain logic.
4. Export a named constant or factory function from the adapter file.
5. Add the export to the sub-directory `index.ts` barrel.

---

## 4. Red Lines (Hard Fail)

Agent must stop and report when any of the following appears:

1. `import ... from "@/modules/..."` in any infrastructure file.
2. Business invariant or conditional domain rule inside an adapter.
3. Hardcoded Firebase project ID, API key, or Upstash token in source code.
4. Firebase Admin SDK used in a Client Component or client-side barrel export.
5. Adapter method that modifies aggregate state directly without going through a domain use case.
