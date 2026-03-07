---
name: xuanwu-skill
description: Reference codebase skill for the Xuanwu Next.js project. Use when you need to understand project structure, implementation patterns, architecture rules (VS0–VS8 slices, L0–L9 layers, D1–D31 governance), or any source code details. Activate for tasks involving feature slices, shared-kernel contracts, Firebase ACL adapters, projection bus, command/query gateways, or governance rule compliance (D-rules, R-rules, S-rules, A-rules).
---

# Xuanwu Codebase Reference

682 files | 11213 lines | 105390 tokens

## Architecture SSOT

> **Always read `docs/architecture/00-LogicOverview.md` before proposing any structural change.**
> Semantic relations: `docs/knowledge-graph.json` | VS8 guide: `docs/architecture/03-Slices/VS8-SemanticBrain/D21-Body-8Layers.md`

### Layer Map (L0–L9)

| Layer | Role | Primary Path |
|-------|------|-------------|
| L0 | External Triggers | `src/shared-infra/external-triggers/` (legacy: `src/features/infra.external-triggers/`) |
| L1 | Shared Kernel — pure contracts, no I/O | `src/shared-kernel/` |
| L2 | Command Gateway (CBG_ENTRY/AUTH/ROUTE) | `src/shared-infra/gateway-command/` |
| L3 | Domain Slices (VS1–VS8) | `src/features/{slice}.slice/` |
| L4 | IER + Outbox Relay + DLQ Manager | `src/shared-infra/event-router/`, `outbox-relay/`, `dlq-manager/` |
| L5 | Projection Bus | `src/shared-infra/projection-bus/` |
| L6 | Query Gateway | `src/shared-infra/gateway-query/` |
| L7 | Firebase ACL (SOLE Firebase SDK access) | `src/shared-infra/frontend-firebase/{auth,firestore,messaging,storage}/` |
| L8 | Firebase Platform (external runtime) | — (SDK, not in repo) |
| L9 | Observability (trace/metrics/errors) | `src/shared-infra/observability/` |

### Vertical Slices (VS0–VS8)

| ID | Slice | Directory |
|----|-------|-----------|
| VS0-Kernel | SharedKernel (L1 contracts) | `src/shared-kernel/` |
| VS0-Infra | Foundation Infra (L0/L2/L4–L9) | `src/shared-infra/` |
| VS1 | Identity | `src/features/identity.slice/` |
| VS2 | Account | `src/features/account.slice/` |
| VS3 | Skill XP | `src/features/skill-xp.slice/` |
| VS4 | Organization | `src/features/organization.slice/` |
| VS5 | Workspace | `src/features/workspace.slice/` |
| VS6 | Workforce-Scheduling | `src/features/workforce-scheduling.slice/` |
| VS7 | Notification Hub | `src/features/notification-hub.slice/` |
| VS8 | Semantic Graph Engine | `src/features/semantic-graph.slice/` |
| — | Global Search (cross-cut authority) | `src/features/global-search.slice/` |

### Dependency Direction (write/read chains)

```
Write chain:  L0 → L2 → L3 → L4 → L5
Read chain:   UI/L0 → L6 → L5 (Read Models)
Infra chain:  L3/L5/L6 → L1 (SK_PORTS) → L7 (FIREBASE_ACL) → L8
```

- **Forbidden**: Cross-slice direct mutate; use L4 IER Domain Event [#2 D9]
- **Forbidden**: Any `import firebase/*` outside L7 FIREBASE_ACL [D24]
- **Forbidden**: Cross-slice import except via `{slice}/index.ts` [D7]

### Hard Invariants (never violate)

| Rule | Constraint |
|------|-----------|
| **D7** | Cross-slice reference only via `{slice}/index.ts` |
| **D8** | `shared-kernel` must be pure — no async/Firestore/side-effects |
| **D24** | Feature slices must NOT `import firebase/*`; use SK_PORTS → FIREBASE_ACL |
| **D26** | Slices must NOT build their own search or send push/SMS directly |
| **S2** | All Projection writes must call `applyVersionGuard()` |
| **S4** | Staleness values must reference `SK_STALENESS_CONTRACT` |
| **R8** | `traceId` injected once at CBG_ENTRY; read-only across full chain |
| **A8** | One command = one aggregate |
| **#9** | Projections must be rebuildable from events via event-funnel |
| **#12** | `getTier()` always derived; never store Tier in DB |
| **#13** | Every XP mutation must write Ledger |

### Naming Conventions

| Pattern | Meaning |
|---------|---------|
| `_actions.ts` | Server Actions / Command Gateway entry points (L2/L3) |
| `_queries.ts` | Query Gateway reads (L6) |
| `_events.ts` | Domain / IER event definitions |
| `_contract.ts` | Public interface exported via `index.ts` |
| `index.ts` | Slice public API surface [D7] |
| `_hooks/` | React hooks (Client Components only) |
| `_components/` | React UI components |

### Bootstrap Commands

```bash
npm install          # MANDATORY first — sandbox has no node_modules
npm run lint         # ESLint D1–D26 checks (0 errors expected, ~1390 warnings)
npm run typecheck    # tsc --noEmit (67 errors in firebase/functions/** are unrelated)
npm run check        # lint + typecheck in one pass
npm run dev          # Dev server at http://localhost:9002
```

## Reference Files

| File | Contents |
|------|----------|
| `references/summary.md` | **Start here** — purpose, format, statistics, excluded patterns |
| `references/project-structure.md` | Full directory tree with line counts |
| `references/files.md` | All source file contents (search with `## File: <path>`) |

## How to Use This Skill

### 1. Locate files

Check `references/project-structure.md` for the directory tree.

### 2. Read file contents

Grep `references/files.md` for the file path header:

```
## File: src/features/workspace.slice/core/_actions.ts
```

### 3. Search for code patterns

Grep `references/files.md` for function names, type names, or rule references:

```
SK_VERSION_GUARD
applyVersionGuard
```

## Common Use Cases

**Implement a new feature in a slice:**
1. Read `docs/architecture/00-LogicOverview.md` for the relevant VS section
2. Check `references/project-structure.md` for existing slice structure
3. Find similar aggregates/actions in `references/files.md`
4. Follow naming conventions and D-rule constraints above

**Check governance compliance:**
1. Identify which D/R/S/A rule is relevant
2. Grep `references/files.md` for existing compliant patterns
3. Verify no direct `firebase/*` import or cross-slice direct mutate

**Trace an event flow:**
1. Search `references/files.md` for the event name
2. Follow from `_events.ts` → `_actions.ts` → outbox → IER lane → projection

**Understand a Projection:**
1. Search for `applyVersionGuard` in `references/files.md`
2. Identify which `SK_STALENESS_CONTRACT` constant the projection uses
3. Confirm it is driven by event-funnel (L5)

## Tips

- Use line counts in `project-structure.md` to estimate file complexity
- Search `## File:` pattern to jump between files in `files.md`
- The architecture SSOT is `docs/architecture/00-LogicOverview.md`, not the code itself
- D24 violations exist in 43 files (tracked migration debt — do not add new ones)

---

This skill was generated by [Repomix](https://github.com/yamadashy/repomix) and aligned with `docs/architecture/00-LogicOverview.md` (Architecture SSOT).
