# `src/infrastructure/` — Concrete Adapters

## Purpose

`src/infrastructure/` provides **concrete implementations of port interfaces** defined in `src/shared/ports/` and in each module's `domain.*/_ports.ts`. It contains all external I/O: Firebase (Firestore, Storage, Auth), Upstash (Redis, QStash, Vector, Workflow), and Google Document AI / Genkit.

Infrastructure adapters have **no business logic** — they translate between domain port contracts and third-party SDK calls.

## Directory Structure

```
src/infrastructure/
├── firebase/           ← Firebase platform adapters
│   ├── app.ts          ← Firebase app initialization (client + admin)
│   ├── admin/          ← Firebase Admin SDK helpers (server-only)
│   ├── client/         ← Firebase Web SDK helpers (client-safe)
│   └── index.ts        ← Barrel re-exports
│
├── upstash/            ← Upstash serverless service adapters
│   ├── redis.ts        ← Redis cache (implements ICachePort)
│   ├── qstash.ts       ← Task queue (implements IQueuePort)
│   ├── vector.ts       ← Vector index for semantic search (implements IVectorIndexPort)
│   ├── workflow.ts     ← Durable workflows (implements IWorkflowPort)
│   ├── box.ts          ← Blob / sandbox storage adapter
│   └── index.ts        ← Barrel re-exports
│
└── document-ai/        ← Google Document AI + Genkit ML pipeline
    ├── genkit.ts       ← Genkit LLM integration
    ├── flows/          ← Document parsing and extraction workflows
    ├── schemas/        ← Zod schemas for Document AI responses
    └── index.ts        ← Barrel re-exports
```

## Dependency Direction

```
src/infrastructure/
   ↓  implements port interfaces from
src/shared/ports/              ← ICachePort, IQueuePort, IVectorIndexPort, IWorkflowPort
src/modules/<name>.module/domain.*/_ports.ts  ← module-scoped repository ports

src/infrastructure/ MUST NOT import from:
   src/modules/               ← adapters are injected into modules, not the reverse
   src/app/                   ← infrastructure is not a Next.js concern
```

Module-level infrastructure adapters (`infra.<adapter>/`) live **inside each module** when the port is module-scoped (e.g. Firestore repository for a single aggregate). This directory hosts **cross-cutting adapters** shared by multiple modules.

## Port → Adapter Mapping

| Port Interface | Location | Concrete Adapter | SDK |
|---------------|----------|-----------------|-----|
| `ICachePort` | `src/shared/ports/` | `redis` | Upstash Redis |
| `IQueuePort` | `src/shared/ports/` | `qstash` | Upstash QStash |
| `IVectorIndexPort` | `src/shared/ports/` | `vector` | Upstash Vector |
| `IWorkflowPort` | `src/shared/ports/` | `workflow` | Upstash Workflow |
| Firebase Admin | (no interface) | `admin/*` | Firebase Admin SDK |
| Firebase Client | (no interface) | `client/*` | Firebase Web SDK |
| Document AI | (no interface) | `document-ai/*` | Google Document AI + Genkit |

## Coding Conventions

- **Server-only** — Firebase Admin and Upstash adapters must be imported only in Server Components, Server Actions, or Route Handlers; mark files with `import "server-only"` where appropriate.
- **No business logic** — adapters translate port contracts to SDK calls; domain rules belong in `src/modules/*/domain.*`.
- **Named exports only** — each adapter file exports a named constant or function; avoid default exports.
- **Environment variables** — SDK initialization must read credentials from `process.env.*`; never hardcode keys.
- **Error wrapping** — catch SDK errors at the adapter boundary and re-throw as typed `AppError` subclasses from `src/shared/errors/`.

## Import Rules

```typescript
// ✅ Correct — use the Upstash Redis adapter (server-side only)
import { redis } from "@/infrastructure/upstash";

// ✅ Correct — use Firebase Admin in a Server Action
import { adminDb } from "@/infrastructure/firebase/admin";

// ❌ Wrong — infrastructure must not call domain use cases
import { createWorkspaceUseCase } from "@/modules/workspace.module";
```

## See Also

- Port interfaces: [`src/shared/ports/`](../shared/README.md)
- Module-scoped adapters: [`src/modules/README.md`](../modules/README.md)
- Architecture SSOT: [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](../../docs/architecture/notes/model-driven-hexagonal-architecture.md)
