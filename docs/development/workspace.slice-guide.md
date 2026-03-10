# workspace.slice (VS5) — Implementation Guide

This guide provides implementation-level detail for `src/features/workspace.slice`.
It supplements the root `DEVELOPMENT.md` and the architecture SSOT
(`docs/architecture/00-logic-overview.md`).

---

## Contents

1. [Slice Entry Point and Public API](#1-slice-entry-point-and-public-api)
2. [Application Pipeline Detail](#2-application-pipeline-detail)
3. [Sub-Slice Implementation Patterns](#3-sub-slice-implementation-patterns)
4. [Event Bus and Event Store](#4-event-bus-and-event-store)
5. [Workflow State Machine [R6]](#5-workflow-state-machine-r6)
6. [File and Document Parsing Flow](#6-file-and-document-parsing-flow)
7. [Adding a New Sub-Slice](#7-adding-a-new-sub-slice)
8. [Architecture Compliance Checklist](#8-architecture-compliance-checklist)

---

## 1. Slice Entry Point and Public API

The single public API surface for the entire VS5 slice is:

```
src/features/workspace.slice/index.ts
```

All external consumers import from `@/features/workspace.slice`. Imports from internal
sub-directories are forbidden (rule D7).

When adding new public symbols, export them from the appropriate sub-slice barrel first, then
re-export from `index.ts`. Group related exports with a section comment matching the existing
pattern:

```ts
// ─── domain.my-feature ───────────────────────────────────────────────────────
export { MyFeatureComponent, myFeatureQuery } from './domain.my-feature'
export type { MyFeatureType } from './domain.my-feature'
```

---

## 2. Application Pipeline Detail

### 2.1 ScopeGuard (`_scope-guard.ts`)

Validates workspace membership before any command executes. Reads **only** from the
`workspace-scope-guard-view` projection — never from the raw `workspaces/` collection (invariant
Prohibition #7).

```ts
const guard = await checkWorkspaceAccess(workspaceId, userId)
// Returns: { allowed: boolean; role?: WorkspaceRole; reason?: string }
```

If the projection is unavailable, access is denied. Callers must handle this gracefully (retry
or surface an error to the user).

### 2.2 PolicyEngine (`_policy-engine.ts`)

Role-based access control for workspace actions. Roles: `Manager`, `Contributor`, `Viewer`.

Permissions use `resource:action` patterns. The wildcard `*` grants all actions for a resource:

```ts
const decision = evaluatePolicy(role, 'tasks:create')
// Returns: { permitted: boolean; reason?: string }
```

To add a new capability, add an entry to `ROLE_PERMISSIONS` and update the relevant test in
`_actions.test.ts`.

### 2.3 TransactionRunner (`_transaction-runner.ts`)

Runs the command handler in a trace-correlated context. Provides the `Outbox` for collecting
Domain Events during execution. After the handler returns, all events are appended to the
Firestore event store.

```ts
const result = await runTransaction(workspaceId, async (ctx: TransactionContext) => {
  // ctx.workspaceId — the workspace being operated on
  // ctx.correlationId — traceId for observability
  // ctx.outbox.collect(type, payload) — record a domain event
  const id = await createTask(workspaceId, data)
  ctx.outbox.collect('workspace:tasks:completed', { task: { ...data, id }, traceId: ctx.correlationId })
  return id
})
// result.value — return value from the handler
// result.events — events that were appended to the event store
```

### 2.4 Outbox (`_outbox.ts`)

The Outbox buffers Domain Events during a transaction and then flushes them to the in-process
WorkspaceEventBus after the Firestore write commits.

Events listed in `WS_OUTBOX_PERSISTED_EVENTS` are also written to the `wsOutbox/{id}` Firestore
collection so the `OUTBOX_RELAY_WORKER` can deliver them to the IER with at-least-once semantics.

**Invariant D29**: the aggregate write and the outbox collection happen in the same logical
transaction. Never call `outbox.collect` outside the transaction handler.

### 2.5 Full `executeCommand` call

```ts
import { executeCommand } from '@/features/workspace.slice/domain.application'
import { useWorkspaceEventBus } from '@/features/workspace.slice/core.event-bus'

// In a Server Action ('use server' at the top of the file):
const { publish } = useWorkspaceEventBusServer()  // server-side bus reference

const result = await executeCommand(
  {
    workspaceId,
    userId,
    action: 'tasks:create',   // maps to PolicyEngine permission lookup
  },
  async (ctx) => {
    const id = await createTask(workspaceId, taskData)
    ctx.outbox.collect('workspace:tasks:completed', {
      task: { ...taskData, id },
      traceId: ctx.correlationId,
    })
    return id
  },
  publish
)

if (!result.success) {
  throw new Error(result.error)
}
return result.value  // the task id returned by the handler
```

---

## 3. Sub-Slice Implementation Patterns

### File-naming conventions

| File | Layer | Content |
|---|---|---|
| `_types.ts` | Types | Local TypeScript types (non-exported or re-exported via barrel) |
| `_contract.ts` | Public contract | Stable interface exported via `index.ts` |
| `_actions.ts` | L2 Command Gateway | Server Actions — `'use server'` directive required |
| `_queries.ts` | L6 Query Gateway | Read-only data fetching functions |
| `_hooks/` | L0 UI | React hooks (`useXxx`) — client-side only |
| `_components/` | L0 UI | React components — may be server or client |
| `_events.ts` | L4 IER | Event definitions (types and payload contracts) |
| `index.ts` | Public API | Barrel — only file imported by other slices or `workspace.slice/index.ts` |

### Typical sub-slice structure

```
domain.my-feature/
├── index.ts              public barrel
├── _types.ts             local domain types
├── _actions.ts           Server Actions (mutations)
├── _queries.ts           read functions (no side effects)
├── _hooks/
│   └── use-my-feature.ts React hook
└── _components/
    └── MyFeatureView.tsx  React component
```

---

## 4. Event Bus and Event Store

### Event Bus (`core.event-bus`)

The in-process typed pub/sub channel. Events flow: Outbox flush → EventBus → subscribers.

Event names are typed in `_events.ts` and map to payload types via `WorkspaceEventPayloadMap`:

```ts
// Publishing (from outbox flush)
publish('workspace:tasks:completed', payload)

// Subscribing (React component)
const { on } = useWorkspaceEventBus()
useEffect(() => {
  return on('workspace:tasks:completed', ({ task }) => {
    // react to the event
  })
}, [on])
```

### Event Store (`core.event-store`)

Append-only Firestore collection at `workspaces/{workspaceId}/events`. Events written by the
TransactionRunner are immutable — the collection is write-once, read-many for audit/replay.

```ts
import { appendDomainEvent, getDomainEvents } from '@/features/workspace.slice'

// Append (done internally by TransactionRunner — do not call manually)
await appendDomainEvent(workspaceId, storedEvent)

// Replay (for audit / diagnostic use)
const events = await getDomainEvents(workspaceId, { after: checkpoint })
```

---

## 5. Workflow State Machine [R6]

The workflow aggregate (`domain.workflow/_aggregate.ts`) enforces stage transitions and blocking
logic.

### Stage Lifecycle

```
Draft → InProgress → QA (quality-assurance) → Acceptance → Finance → Completed
```

Transitions are validated against `WORKFLOW_STAGE_ORDER`. Skipping stages is forbidden.

### Blocking / Unblocking

A workflow enters a `blocked` state when a B-track issue is raised:

```ts
blockWorkflow(state, issueId)    // adds issueId to blockedBy set
unblockWorkflow(state, issueId)  // removes issueId from blockedBy set
// state.blockedBy.length > 0 → workflow is blocked
// state.blockedBy.length === 0 → workflow is unblocked
```

**Invariant A3**: `blockWorkflow` accumulates issues; `unblockWorkflow` removes one at a time.
The workflow is only truly unblocked when `blockedBy` is empty.

### Persistence

Workflow aggregate state is persisted at:

```
workflowStates/{workspaceId}/workflows/{workflowId}
```

The `domain.workflow/_persistence.ts` module handles read/write through the Firestore write/read
adapters — not through the facade (because workflow state is an internal aggregate concern, not
exposed via the facade's public repository surface).

---

## 6. File and Document Parsing Flow

### Upload → Parsing Pipeline

```
1. User uploads file via domain.files
   ├─ uploadTaskAttachment(workspaceId, taskId, file)
   ├─ uploadDailyPhoto(workspaceId, logId, file)
   └─ uploadRawFile(workspaceId, file)

2. domain.parsing-intent creates a ParsingIntent document in Firestore
   workspaces/{workspaceId}/parsingIntents/{intentId}
   status: 'pending' → 'processing' → 'imported' | 'superseded'

3. Cloud Function (L7-B) is triggered by the Firestore write
   Calls extractInvoiceItems (Genkit flow, L10)

4. extractInvoiceItems returns WorkItem[]
   Each item has: description, quantity, unitPrice, discount, price, semanticTagSlug, sourceIntentIndex

5. [PLANNED] classifyWorkItemsForDictionary (Genkit flow, L10)
   Runs the three-stage classification pipeline:
   ├─ Stage 1: resolveOrgTaskTypeByItemName  — exact/alias text match
   ├─ Stage 2: IEmbeddingPort + VectorStore  — cosine similarity against dictionary embeddings
   └─ Stage 3: suggestTaskTypeDraftFromAI    — LLM draft for unmatched items
   Returns:
   ├─ ClassifiedWorkItem[] — items annotated with taskTypeSlug + requiredSkills
   └─ DictionaryProposal[] — new entries awaiting user review

6. WorkItems / ClassifiedWorkItems are materialised into workspace tasks
   via createParsingImport (idempotency ledger) + createTask

7. DictionaryProposals are surfaced in the review UI
   User approves → addOrgTaskTypeAction (VS4) → dictionary enriched for future parses
```

### ParsingIntent States

| Status | Meaning |
|---|---|
| `pending` | Intent created, waiting for Cloud Function to pick it up |
| `processing` | Cloud Function is running the Genkit extraction |
| `imported` | All items materialised into tasks; `markParsingIntentImported()` called |
| `superseded` | A newer intent replaced this one; `supersedeParsingIntent()` called |

### Task-Type Classification — Boundary Rules

The classification step crosses slice boundaries (VS5 → VS4 dictionary).  Follow these rules:

- **Load dictionary data in the calling Server Action** (`_form-actions.ts`), then pass it as
  flow input.  Flows (`classify-work-items.ts`) must never read from Firestore directly.
- **Write approved proposals through VS4 barrel** — call `addOrgTaskTypeAction` from
  `@/features/organization.slice`, never from an internal path.
- **VS8 vector infrastructure** (`IEmbeddingPort`, `VectorStore`) is accessed through the VS8
  public barrel (`@/features/semantic-graph.slice`) — do not import from sub-paths.

For the full feedback loop design, see
[`docs/development/semantic-dictionary-guide.md`](semantic-dictionary-guide.md).

---

## 7. Adding a New Sub-Slice

Follow this checklist when adding a new sub-domain to workspace.slice:

- [ ] Create the directory `src/features/workspace.slice/domain.my-feature/`
- [ ] Add `index.ts`, `_types.ts`, `_actions.ts`, `_queries.ts` (and `_hooks/`, `_components/` as needed)
- [ ] Route all Server Actions through `executeCommand` in `domain.application`
- [ ] Route all Firestore access through the facade or write/read adapters (never direct SDK)
- [ ] Define collection path constants in `collection-paths.ts` if new Firestore collections are needed
- [ ] Export public symbols from the sub-slice `index.ts`
- [ ] Re-export from `src/features/workspace.slice/index.ts`
- [ ] Update the sub-slice map in this guide and in `DEVELOPMENT.md`
- [ ] Add or update tests in `domain.my-feature/*.test.ts`
- [ ] Update the architecture compliance test in `domain.parsing-intent/architecture-compliance.test.ts` if new D24/D7 boundary checks are needed
- [ ] Add the entity to `.memory/knowledge-graph.json` if it introduces a new domain concept

---

## 8. Architecture Compliance Checklist

Before merging any change to workspace.slice, verify:

| Check | Rule | Source |
|---|---|---|
| No `firebase/*` imports in slice files | D24 | `eslint.config.mts`, `architecture-compliance.test.ts` |
| All cross-slice imports via `index.ts` | D7 | ESLint |
| New Firestore paths registered in `collection-paths.ts` | D24 | Convention |
| Commands route through `executeCommand` | A8, D29 | Application pipeline |
| Domain Events produced only inside the transaction handler | Invariant #4a | `_outbox.ts` |
| TransactionRunner does not produce its own events | Invariant #4b | `_transaction-runner.ts` |
| Scope guard reads only from projection, not raw collection | Prohibition #7 | `_scope-guard.ts` |
| Projection writes use `applyVersionGuard()` | S2 | `_projection-guard.ts` |
| `traceId` not mutated after injection | R8 | `_transaction-runner.ts` |
| New sub-slice exported from barrel and guide updated | D7, docs | `index.ts`, this file |
