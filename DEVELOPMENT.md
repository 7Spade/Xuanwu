# Xuanwu — Development Guide

This guide explains the architecture, data patterns, and AI integration for the Xuanwu platform.
It is intentionally machine-readable in addition to being human-readable — structured so that AI
assistants can query it as an authoritative reference, verify their understanding, and give
accurate feedback. This design is inspired by [Serena](https://github.com/oraios/serena),
an MCP-based code intelligence server that exposes symbol-level codebase knowledge to AI models.

## Contents

1. [How AI Learns From This Codebase](#1-how-ai-learns-from-this-codebase)
2. [workspace.slice (VS5) Architecture](#2-workspaceslice-vs5-architecture)
3. [Firestore Usage Patterns](#3-firestore-usage-patterns)
4. [Genkit AI Integration](#4-genkit-ai-integration)
5. [Task-Type & Skill-Type Dictionary — Positive Feedback Loop](#5-task-type--skill-type-dictionary--positive-feedback-loop)
6. [AI Feedback Loop — Extending the Knowledge Base](#6-ai-feedback-loop--extending-the-knowledge-base)
7. [Common Patterns and Anti-Patterns](#7-common-patterns-and-anti-patterns)
8. [Bootstrap and Validation Commands](#8-bootstrap-and-validation-commands)

---

## 1. How AI Learns From This Codebase

### 1.1 The Serena Concept Applied Here

[Serena](https://github.com/oraios/serena) exposes code intelligence through MCP tools — symbol
lookup, find references, file trees, and diff editing — so an AI model can navigate and reason
about a codebase rather than guessing from a static snapshot. Xuanwu adopts the same philosophy
through a layered set of **authoritative reference artefacts**:

| Artefact | Role | What AI should do with it |
|---|---|---|
| `docs/architecture/00-logic-overview.md` | Architecture SSOT — layer map, canonical chains, forbidden patterns | Read **first** before any structural change |
| `.memory/knowledge-graph.json` | Semantic entity relationships, edge annotations | Verify domain terminology and ownership |
| `repomix-instruction.md` | AI assistant manifest embedded in the packed codebase | Follow as a behavioural contract when reading packed output |
| `.github/skills/xuanwu-skill/SKILL.md` | Codebase baseline snapshot for prompts and agents | Use as a compact reference when full source is unavailable |
| `eslint.config.mts` | D1–D26 architecture rules enforced as linter errors | Treat violations as hard blockers, not style suggestions |
| `docs/development/*.md` | Feature-level implementation guides | Read before editing a feature slice |

### 1.2 Querying the Knowledge Graph

The file `.memory/knowledge-graph.json` stores entities and relations in a format compatible with
the [memory MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory).
Agents can call `memory-search_nodes` or `memory-open_nodes` to retrieve entity definitions
without reading the full source.

Example: before writing code that touches `workspace.slice`, an agent should:

```
memory-search_nodes("workspace slice VS5")
→ returns entity: WorkspaceSlice, relations: owns → domain.tasks, domain.files, …
```

### 1.3 Feedback Loop

AI feedback is integrated through:

- **Structured rule enforcement** — ESLint rules encode architectural invariants; CI fails on violations.
- **Architecture SSOT** — `00-logic-overview.md` is updated when rules change so AI always reads the
  current contract, never stale inline comments.
- **Skill and prompt synchronisation** — after a significant code change, update
  `.github/skills/xuanwu-skill/SKILL.md` and the relevant `docs/development/*.md` file so future
  AI sessions start with accurate context.

---

## 2. workspace.slice (VS5) Architecture

### 2.1 Overview

`src/features/workspace.slice` is Vertical Slice 5 (VS5). It is the largest business slice in
the platform and owns the workspace aggregate, all sub-domain models, and their command/query
surfaces. External code imports exclusively from its public barrel:

```ts
import { WorkspaceProvider, useWorkspace, WorkspaceFiles, … } from '@/features/workspace.slice'
```

**Never** import from a sub-directory path directly.

### 2.2 Sub-Slice Map

| Sub-slice directory | Responsibility |
|---|---|
| `core/` | Workspace aggregate types, `WorkspaceProvider`, shell components, `useWorkspace` hook |
| `core.event-bus/` | In-process event bus [E5] — `WorkspaceEventBus`, event name/payload contracts |
| `core.event-store/` | Append-only Firestore event store for replay and audit (read-only after write) |
| `domain.application/` | Application pipeline: `ScopeGuard → PolicyEngine → TransactionRunner → Outbox` |
| `gov.role/` | Workspace-level role management (`WorkspaceRole`, grant/revoke) |
| `gov.audit/` | Workspace and account audit views |
| `gov.audit-convergence/` | Audit bridge: normalises heterogeneous audit sources into a unified query |
| `gov.members/` | Member grants + `WorkspaceMembers` UI component |
| `gov.partners/` | Stub — partner views live in `account.slice/org.partner` |
| `gov.teams/` | Stub — team views live in `account.slice` |
| `domain.files/` | File storage: upload, version, delete via Firebase Storage |
| `domain.document-parser/` | Document parsing orchestration [A4] |
| `domain.parsing-intent/` | `ParsingIntent` digital twin contract |
| `domain.tasks/` | Task management — CRUD, status lifecycle, child tasks |
| `domain.daily/` | 施工日誌 (construction daily log) A-track |
| `domain.workflow/` | Workflow aggregate state machine [R6]: Draft → InProgress → QA → Acceptance → Finance → Completed |
| `domain.quality-assurance/` | QA capability (approve / reject) |
| `domain.acceptance/` | Acceptance capability |
| `domain.issues/` | B-track issue tracking [A3] |

> Finance capability (VS9) has been migrated to `finance.slice`; workspace.slice re-exports it
> for backward compatibility.

### 2.3 Application Pipeline

Every mutating action flows through the **workspace application pipeline** defined in
`domain.application/`:

```
Server Action (_actions.ts)
  └─▶ executeCommand(command, handler, publish)
        ├─ checkWorkspaceAccess()      ScopeGuard  — verifies workspace membership
        ├─ evaluatePolicy()            PolicyEngine — checks role-based action permission
        ├─ runTransaction(handler)     TransactionRunner — calls handler inside a logical tx
        │     └─ handler receives TransactionContext { outbox }
        │          └─ handler calls outbox.collect(event) to produce Domain Events
        └─ outbox.flush(publish)       Outbox — emits events to WorkspaceEventBus after commit
```

**Invariants to respect (from 00-logic-overview.md):**

- `A8` — One command = one aggregate per transaction.
- `D29` — Aggregate write and outbox collection happen in the same transaction.
- `R8` — `traceId` is injected once at the command gateway and is read-only throughout.

### 2.4 Event Bus

`core.event-bus/` provides a typed in-process pub/sub channel. Events are published after the
Firestore transaction commits (via the Outbox). Domain Events produced in `domain.workflow/` or
`domain.issues/` may also trigger cross-slice side effects via the IER (Internal Event Router).

```ts
// Publishing a domain event from an action handler
ctx.outbox.collect('workspace:tasks:completed', { task, traceId })

// Subscribing in a component via the hook
const { on } = useWorkspaceEventBus()
useEffect(() => on('workspace:tasks:completed', handler), [])
```

### 2.5 Workflow State Machine [R6]

The workflow aggregate in `domain.workflow/_aggregate.ts` defines the canonical stage lifecycle:

```
Draft → InProgress → QA → Acceptance → Finance → Completed
```

A workflow is **blocked** when `blockedBy.length > 0` (B-track issues). The workflow can only
advance to the next stage once all blocking issues are resolved (`unblockWorkflow` removes one
issueId; only an empty `blockedBy` fully unblocks).

### 2.6 File & Document Parsing Flow

```
User uploads file
  └─▶ uploadRawFile() / uploadTaskAttachment()     domain.files
        └─▶ ParsingIntent created in Firestore      domain.parsing-intent
              └─▶ Cloud Function triggered           (L7-B admin layer)
                    └─▶ extractInvoiceItems (Genkit) src/app-runtime/ai/flows
                          └─▶ Structured task data returned to workspace
```

---

## 3. Firestore Usage Patterns

### 3.1 ACL Boundary Rule [D24]

> Feature slices **must not** import `firebase/*` or `firebase-admin` directly.

All Firestore access goes through the boundary adapter chain:

```
feature slice
  └─▶ @/shared-infra/frontend-firebase/firestore/firestore.facade
        └─▶ @/shared-infra/frontend-firebase/firestore/repositories/*
              └─▶ @/shared-infra/frontend-firebase (firestore.client, write.adapter, read.adapter)
                    └─▶ firebase/firestore (SDK — L7-A boundary)
```

**Correct:**
```ts
import { getWorkspaceFiles } from '@/shared-infra/frontend-firebase/firestore/firestore.facade'
```

**Forbidden:**
```ts
import { collection, getDocs } from 'firebase/firestore'  // ❌ D24 violation
```

### 3.2 Collection Path Constants

All Firestore collection path strings are defined in one place:

```
src/shared-infra/frontend-firebase/firestore/collection-paths.ts
```

| Constant | Path | Owner |
|---|---|---|
| `COLLECTIONS.accounts` | `accounts` | VS2 Account |
| `COLLECTIONS.workspaceScopeGuardView` | `workspace-scope-guard-view` | VS8 Projection |
| `SUBCOLLECTIONS.workspaces` | `accounts/{orgId}/workspaces` | VS5 Workspace |
| `SUBCOLLECTIONS.workspaceTasks` | `workspaces/{id}/tasks` | VS5 domain.tasks |
| `SUBCOLLECTIONS.workspaceFiles` | `workspaces/{id}/files` | VS5 domain.files |
| `SUBCOLLECTIONS.workspaceEvents` | `workspaces/{id}/events` | VS5 core.event-store |
| `SUBCOLLECTIONS.parsingIntents` | `workspaces/{id}/parsingIntents` | VS5 domain.parsing-intent |

**Never** hardcode collection strings — always import from `collection-paths.ts`.

### 3.3 Facade Pattern

`firestore.facade.ts` is a thin re-export layer over the repository modules. It provides a
stable public surface so that refactoring a repository does not require updating every caller.

```ts
// firestore.facade.ts — illustrative structure
import * as repositories from './repositories'

export const createWorkspace       = repositories.createWorkspace
export const getWorkspaceTasks     = repositories.getWorkspaceTasks
export const createParsingIntent   = repositories.createParsingIntent
// …all workspace operations re-exported here
```

### 3.4 Write Adapter vs. Read Adapter

| Adapter | File | Use for |
|---|---|---|
| Write | `firestore.write.adapter` | `setDocument`, `updateDocument`, `addDocument`, `deleteDocument` |
| Read | `firestore.read.adapter` | `getDocument`, `collection`, `query`, `where`, `getDocs`, subscriptions |

Keep read and write operations in separate files (e.g. `_queries.ts` for reads, `_actions.ts`
for writes) to respect the canonical read/write chain split.

### 3.5 Domain Events in Firestore (Event Store)

The `core.event-store` sub-slice appends immutable domain events to
`workspaces/{workspaceId}/events`. Events are **write-once** and used for audit/replay only —
never mutate an event document.

```ts
import { appendDomainEvent } from '@/shared-infra/frontend-firebase/firestore/firestore.facade'

await appendDomainEvent(workspaceId, {
  type: 'workspace:tasks:completed',
  payload: { task, traceId },
  timestamp: Date.now(),
})
```

### 3.6 Projection Writes [S2]

Any Firestore write to a VS8 Projection collection **must** call `applyVersionGuard()` before
writing. This prevents out-of-order replay from overwriting a newer projection state with an
older one.

---

## 4. Genkit AI Integration

### 4.1 Overview

Genkit AI flows live in `src/app-runtime/ai/`. This is Layer L10 in the architecture — the AI
runtime and orchestration layer. Flows are server-side only (`'use server'` directive at the
top of each flow file).

```
src/app-runtime/ai/
├── genkit.ts            — Genkit instance, model config (gemini-2.5-flash)
├── dev.ts               — Development server entry point (loads all flows)
├── index.ts             — Public exports
├── flows/
│   ├── extract-invoice-items.ts              — OCR → structured line items with semantic tags
│   ├── suggest-semantic-dictionary-entry.ts  — Draft task-type / skill-type entries (manual prompt)
│   ├── classify-work-items.ts                — (planned) WorkItem[] → task-type classification + proposals
│   └── adapt-ui-color-to-account-context.ts  — AI-suggested UI colour palette
└── schemas/
    ├── docu-parse.ts                    — Invoice extraction I/O schemas
    └── semantic-dictionary-assistant.ts — Semantic dictionary assistant schemas
```

### 4.2 Genkit Instance

```ts
// src/app-runtime/ai/genkit.ts
import { googleAI } from '@genkit-ai/google-genai'
import { genkit } from 'genkit'

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
})
```

Import `ai` from this module whenever defining a new flow or prompt; do not create a second
Genkit instance.

### 4.3 Defining a Flow

Every flow follows this structure:

```ts
'use server'

import { z } from 'genkit'
import { ai } from '@/app-runtime/ai/genkit'
import { MyInputSchema, MyOutputSchema } from '@/app-runtime/ai/schemas/my-schema'

// 1. Define an optional intermediate prompt schema if the flow massages the input
const PromptInputSchema = z.object({ serialisedData: z.string() })

// 2. Define the prompt
const myPrompt = ai.definePrompt({
  name: 'myPrompt',
  input:  { schema: PromptInputSchema },
  output: { schema: MyOutputSchema },
  prompt: `…prompt text…`,
})

// 3. Define the flow (wraps the prompt with pre/post-processing)
const myFlow = ai.defineFlow(
  { name: 'myFlow', inputSchema: MyInputSchema, outputSchema: MyOutputSchema },
  async (input) => {
    const result = await myPrompt({ serialisedData: JSON.stringify(input) })
    return result.output  // matches MyOutputSchema
  }
)

// 4. Export a typed wrapper function
export async function myFeature(
  input: z.infer<typeof MyInputSchema>
): Promise<z.infer<typeof MyOutputSchema>> {
  return myFlow(input)
}
```

### 4.4 Registering a New Flow

When adding a new flow:

1. Create the flow file under `src/app-runtime/ai/flows/my-flow.ts`.
2. Import it in `src/app-runtime/ai/dev.ts` to register it with the dev server.
3. Export the public function from `src/app-runtime/ai/index.ts`.
4. Update `src/app-runtime/ai/README.md` to list the new flow.

### 4.5 Calling a Flow from a Server Action

Flows are called from Server Actions in the appropriate feature slice:

```ts
// src/features/workspace.slice/domain.document-parser/_actions.ts
'use server'

import { extractInvoiceItems } from '@/app-runtime/ai'

export async function parseDocumentAction(workspaceId: string, documentObjectJson: string) {
  const result = await extractInvoiceItems({ documentObjectJson })
  // result.workItems is the typed array of extracted line items
  return result
}
```

**Boundary rules for flows:**

- ✅ Flows may depend on `genkit`, `@genkit-ai/*`, and `@/app-runtime/ai/schemas/*`.
- ✅ Flows are called from Server Actions in `_actions.ts` files.
- ❌ Flows must not import React components or `'use client'` modules.
- ❌ Flows must not contain domain business logic — keep them as inference wrappers only.

### 4.6 Schema Design

Use Zod schemas (exported from `schemas/`) to define flow I/O contracts. Schemas are shared
between the flow definition and the TypeScript types — derive types from the schema, not the
other way around:

```ts
// schemas/my-schema.ts
import { z } from 'genkit'

export const MyInputSchema = z.object({
  workspaceId: z.string(),
  data: z.string().describe('Serialised input payload'),
})

export const MyOutputSchema = z.object({
  result: z.array(z.string()),
})

export type MyInput  = z.infer<typeof MyInputSchema>
export type MyOutput = z.infer<typeof MyOutputSchema>
```

---

## 5. Task-Type & Skill-Type Dictionary — Positive Feedback Loop

This is the core AI learning feature: every document the system parses is an opportunity to
enrich the org-level semantic dictionaries so that the next parse is more accurate.

### 5.1 The Dictionaries

**Owner**: `src/features/organization.slice/gov.semantic/` (VS4)

| Dictionary | Firestore path | Type |
|---|---|---|
| Task-Type | `orgSemanticRegistry/{orgId}/taskTypes/{slug}` | `OrgTaskTypeEntry` |
| Skill-Type | `orgSemanticRegistry/{orgId}/skillTypes/{slug}` | `OrgSkillTypeEntry` |

`OrgTaskTypeEntry` links a task type to the skills it requires (`requiredSkills: SkillRequirement[]`).
`OrgSkillTypeEntry` is a named skill category with aliases.

Both are managed through the `OrgSemanticDictionaryPanel` UI and the `addOrgTaskTypeAction` /
`addOrgSkillTypeAction` Server Actions.

### 5.2 Current Gap

After `extractInvoiceItems` runs, each `WorkItem` has:

- `item` — description text
- `semanticTagSlug` — VS8 cost-item classification (e.g. `cost-item-executable`)

What it does **not** have:

- `taskTypeSlug` — which org-specific task type this item belongs to
- `requiredSkills` — what skills are needed to perform this task

There is no automatic path from the parsing output to the org dictionaries today.

### 5.3 Positive Feedback Loop Architecture

```
Parse document
      ↓
extractInvoiceItems (Genkit)      → WorkItem[] + semanticTagSlug
      ↓
classifyWorkItemsForDictionary    ← reads orgSemanticRegistry (task-types + skill-types)
  ├─ Stage 1: exact / alias text match  → confidence 0.9–1.0 → tag immediately
  ├─ Stage 2: vector cosine similarity  → confidence 0.5–1.0 → tag or flag for review
  └─ Stage 3: LLM fallback (Genkit)     → confidence 0.5     → DictionaryProposal[]
      ↓
DictionaryProposal[] surfaced to user
      ↓
User approves / edits / dismisses
      ↓
addOrgTaskTypeAction / addOrgSkillTypeAction writes approved entries
→ embedding generated and stored on entry
      ↓
orgSemanticRegistry enriched  ──→  (next parse: higher Stage-1/2 hit rate)
```

### 5.4 Three-Stage Classification Algorithm

| Stage | Method | Confidence | Action |
|---|---|---|---|
| 1 | Exact name match (`resolveOrgTaskTypeByItemName`) | 1.0 | Tag immediately |
| 1 | Alias match | 0.9 | Tag immediately |
| 2 | Vector cosine similarity ≥ 0.75 | 0.75–1.0 | Tag with confirmation |
| 2 | Vector cosine similarity 0.5–0.75 | 0.5–0.75 | Flag for review |
| 3 | LLM suggestion (`suggestTaskTypeDraftFromAI`) | 0.5 | Show proposal for approval |
| — | No match | 0.0 | Show "uncategorised" warning |

### 5.5 Vector Infrastructure

VS8 already provides the building blocks:

| Component | Location |
|---|---|
| `IEmbeddingPort` | `src/features/semantic-graph.slice/core/embeddings/embedding-port.ts` |
| `VectorStore` (cosine similarity) | `src/features/semantic-graph.slice/core/embeddings/vector-store.ts` |

The recommended strategy is to add an `embedding?: number[]` field to `OrgTaskTypeEntry` and
`OrgSkillTypeEntry`, generated when an entry is created or updated using the `IEmbeddingPort`.

Embedding text convention:
```
dict::task-type/{slug} {name} {aliases joined by space} {description}
```

Using the `dict::` prefix keeps these embeddings semantically distinct from VS8 `tag::` vectors.

### 5.6 Planned Genkit Flow: `classifyWorkItemsForDictionary`

```ts
// src/app-runtime/ai/flows/classify-work-items.ts  (to be implemented)

export interface ClassifyWorkItemsInput {
  orgId: string
  workItems: WorkItem[]             // from extractInvoiceItems
  taskTypes: OrgTaskTypeEntry[]     // loaded by the calling Server Action
  skillTypes: OrgSkillTypeEntry[]
}

export interface ClassifyWorkItemsOutput {
  classified: ClassifiedWorkItem[]  // items annotated with taskTypeSlug + requiredSkills
  proposals: DictionaryProposal[]   // new entries awaiting human review
}

// Calling pattern (from domain.document-parser/_form-actions.ts):
const extraction = await extractInvoiceItems({ documentObject: ocrDocument })
const [taskTypes, skillTypes] = await Promise.all([
  getOrgTaskTypes(orgId),
  getOrgSkillTypes(orgId),
])
const { classified, proposals } = await classifyWorkItemsForDictionary({
  orgId, workItems: extraction.workItems, taskTypes, skillTypes,
})
// proposals → surface in DictionaryProposalReviewPanel
```

**Boundary rules** (same as all Genkit flows):
- ✅ Flow receives data as input — it does NOT read from Firestore directly.
- ✅ Flow returns data as output — it does NOT write to Firestore.
- ✅ Firestore reads (loading task-types) and writes (approving proposals) happen in Server Actions.

### 5.7 Feedback Quality Signals

Track these metrics to measure loop health over time:

| Signal | Target |
|---|---|
| `exactMatchRate` — % of items matched at Stage 1 | Should grow with each document batch |
| `vectorMatchRate` — % matched at Stage 2 | Stable once embeddings are populated |
| `proposalAcceptanceRate` — % of AI proposals approved | Indicates prompt quality |
| `newEntriesPerParse` — avg new entries added per document | Should decrease as dictionary matures |

For full implementation detail see
[`docs/development/semantic-dictionary-guide.md`](docs/development/semantic-dictionary-guide.md).

---

## 6. AI Feedback Loop — Extending the Knowledge Base

This section explains how to keep AI assistants aligned with the codebase as it evolves. The
pattern mirrors how Serena maintains a live code-intelligence layer alongside the source tree.

### 6.1 After Adding a Sub-Slice to workspace.slice

1. **Export from `index.ts`** — Add the public API to the barrel at
   `src/features/workspace.slice/index.ts`.
2. **Update this guide** — Add a row to the sub-slice map in [Section 2.2](#22-sub-slice-map).
3. **Update the knowledge graph** — Add the entity and its relations to
   `.memory/knowledge-graph.json` using the `memory-create_entities` MCP tool.
4. **Update the skill** — If the sub-slice is significant, update
   `.github/skills/xuanwu-skill/SKILL.md` so agents have current context.

### 6.2 After Adding a Genkit Flow

1. Register the flow in `dev.ts` and export from `index.ts`.
2. Update `src/app-runtime/ai/README.md`.
3. Add the flow name and I/O contract to the knowledge graph entity `AIRuntime`.

### 6.3 After Adding a Firestore Collection

1. Add the path constant to `collection-paths.ts` with a JSDoc comment naming the owner VS.
2. Add the repository function to the appropriate repository file and re-export from
   `firestore.facade.ts`.
3. Note the new collection in `docs/persistence-model-overview.md`.

### 6.4 AI Session Initialisation Checklist

When an AI assistant starts a session in this codebase it should:

```
1. Read   docs/architecture/00-logic-overview.md              (architecture contract)
2. Search .memory/knowledge-graph.json                        (entity relationships)
3. Read   repomix-instruction.md                              (AI behaviour manifest)
4. Read   this file (DEVELOPMENT.md)                          (feature patterns)
5. Read   docs/development/workspace.slice-guide.md           (workspace sub-slice detail)
   if the task touches workspace.slice or document parsing
6. Read   docs/development/semantic-dictionary-guide.md       (dictionary feedback loop)
   if the task touches task-type/skill-type classification or Genkit AI flows
```

This initialisation sequence is analogous to Serena loading its semantic index before answering
code-intelligence queries.

### 6.5 Providing AI Feedback

When AI proposes a code change, validate it against:

| Check | Source |
|---|---|
| Layer direction correct? | `00-logic-overview.md` canonical chains |
| D24 Firebase boundary respected? | `eslint.config.mts` rule `no-direct-firebase-import` |
| Cross-slice import through `index.ts`? | D7 rule |
| Projection write uses `applyVersionGuard`? | S2 invariant |
| New Genkit flow registered in `dev.ts`? | Section 4.4 above |
| Knowledge graph updated? | `.memory/knowledge-graph.json` |
| Dictionary feedback loop rules followed? | Section 5 and `semantic-dictionary-guide.md` |

If all checks pass, the change is safe to merge. If not, ask the AI to correct specific
invariants by citing their codes (e.g. "this violates D24 — remove the direct firebase import
and route through the facade").

---

## 7. Common Patterns and Anti-Patterns

### ✅ Correct Patterns

```ts
// Calling a workspace command from a Server Action
import { executeCommand } from '@/features/workspace.slice/domain.application'
const result = await executeCommand(
  { workspaceId, userId, action: 'tasks:create' },
  async (ctx) => {
    const id = await createTask(workspaceId, taskData)
    ctx.outbox.collect('workspace:tasks:completed', { task: { ...taskData, id }, traceId })
    return id
  },
  publish
)

// Reading workspace data
import { getWorkspaceTasks } from '@/shared-infra/frontend-firebase/firestore/firestore.facade'
const tasks = await getWorkspaceTasks(workspaceId)

// Calling a Genkit flow from a Server Action
import { extractInvoiceItems } from '@/app-runtime/ai'
const { workItems } = await extractInvoiceItems({ documentObjectJson })
```

### ❌ Anti-Patterns

```ts
// ❌ D24: direct Firebase SDK import in a feature slice
import { collection, getDocs } from 'firebase/firestore'

// ❌ D7: importing from a sub-slice path instead of the barrel
import { WorkspaceProvider } from '@/features/workspace.slice/core/_components/workspace-provider'

// ❌ A8: two aggregates in one command transaction
ctx.outbox.collect('finance:invoice:created', { … })   // finance belongs in finance.slice

// ❌ Logic in Genkit flow (flows are inference wrappers only)
const ai_result = await myFlow(input)
await updateWorkspace(workspaceId, ai_result)  // ❌ side-effect inside flow
```

---

## 8. Bootstrap and Validation Commands

```bash
# Install dependencies (required in a fresh clone or CI)
npm ci

# Start development server (port 9002)
npm run dev

# Run all architecture and style checks
npm run check          # lint + typecheck

npm run lint           # ESLint D1–D26 (expect 0 errors, ~1390 warnings from tracked debt)
npm run typecheck      # tsc --noEmit (errors in firebase/functions/** are unrelated)

# Run a specific test file
npx vitest run src/features/workspace.slice/domain.workflow/_stage-transition.test.ts

# Pack codebase for AI analysis
npx repomix --config repomix.config.ts
```

---

## See Also

- [`docs/architecture/00-logic-overview.md`](docs/architecture/00-logic-overview.md) — Architecture SSOT
- [`docs/architecture/03-infra-mapping.md`](docs/architecture/03-infra-mapping.md) — Firebase path/adapter map
- [`docs/persistence-model-overview.md`](docs/persistence-model-overview.md) — Persistence responsibilities
- [`docs/development/workspace.slice-guide.md`](docs/development/workspace.slice-guide.md) — Workspace sub-slice implementation guide
- [`docs/development/semantic-dictionary-guide.md`](docs/development/semantic-dictionary-guide.md) — Task-Type/Skill-Type Dictionary feedback loop guide
- [`src/app-runtime/ai/README.md`](src/app-runtime/ai/README.md) — Genkit AI runtime reference
- [`repomix-instruction.md`](repomix-instruction.md) — AI assistant manifest
- [Serena MCP Server](https://github.com/oraios/serena) — Inspiration for AI code-intelligence patterns
