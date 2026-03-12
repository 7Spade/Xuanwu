# AGENTS.md (src/)

Instructions for all code in `src/` — the DDD application root.

## Inheritance
- Inherit from root `AGENTS.md` and `.github/copilot-instructions.md`.

## Architecture Reference
- Primary SSOT: `docs/architecture/README.md`
- Domain model: `docs/architecture/models/domain-model.md`
- Contract spec: `docs/architecture/specs/contract-spec.md`

## DDD Layer Map

| Directory | DDD Layer | Rules |
|-----------|-----------|-------|
| `shared-kernel/` | L1 Shared Kernel | Contracts only, no I/O, no business logic |
| `config/` | Cross-cutting | Config constants, no domain logic |
| `features/*.slice/` | L2 Domain + L3 Application | Bounded contexts, slice autonomy [D7] |
| `features/infra.*/` | L4 Infrastructure | Implements ports, no domain logic |
| `features/projection-bus/` | L5 Read Model | Event subscriptions → materialized views |
| `features/observability/` | L9 Observability | Metrics, error log sinks |
| `shared-infra/` | L9 External Infra | Firebase-specific, no domain logic |
| `app/` | L0 Presentation | Next.js pages and shell |
| `app-runtime/` | L0 Runtime | Providers, AI runtime |
| `lib-ui/` | Shared UI | Reusable components, no domain logic |

## Boundary Rules

- Feature slices MUST only export via their `index.ts` [D7].
- Infrastructure modules MUST implement port interfaces from `shared-kernel/ports/`.
- Shared kernel MUST NOT import from features or infrastructure.
- All cross-slice communication MUST go through the Integration Event Router (IER).

## Migration Note

This `src/` directory was progressively implemented from `src-non/` following standard
DDD development order: Shared Kernel → Domain → Application → Infrastructure → Presentation.
`src-non/` remains as the canonical reference; `src/` is the production-ready DDD target.
