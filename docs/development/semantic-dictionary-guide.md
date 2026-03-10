# Semantic Dictionary Feedback Loop — Development Guide

This guide documents the **Task-Type Dictionary** and **Skill-Type Dictionary** positive
feedback loop.  The goal is for Genkit AI to grow smarter with every document it parses:
each new work item that the parser encounters enriches the dictionary, so subsequent parses
match more accurately and require less human review.

---

## Contents

1. [Concept Overview](#1-concept-overview)
2. [Current Architecture (Baseline)](#2-current-architecture-baseline)
3. [Target Architecture — Positive Feedback Loop](#3-target-architecture--positive-feedback-loop)
4. [Data Model](#4-data-model)
5. [Classification Pipeline Detail](#5-classification-pipeline-detail)
6. [Vector Strategy](#6-vector-strategy)
7. [Genkit Flow: `classifyWorkItemsForDictionary`](#7-genkit-flow-classifyworkitemsfordictionary)
8. [User Feedback Integration](#8-user-feedback-integration)
9. [Implementing the Loop — Step-by-Step](#9-implementing-the-loop--step-by-step)
10. [Architecture Compliance Rules](#10-architecture-compliance-rules)

---

## 1. Concept Overview

### The Problem

When Genkit parses a construction invoice today it extracts `WorkItem[]` and assigns a
`semanticTagSlug` (a VS8 cost-item classification such as `cost-item-executable`).  That tag
tells the system *what kind of cost* the item is.  It does **not** tell the system:

- *What type of task* does this work item represent? (Task-Type Dictionary)
- *What skills are required* to perform this task? (Skill-Type Dictionary)

Those two dimensions are currently populated only by human administrators through the
`OrgSemanticDictionaryPanel` — there is no automatic feedback from the parsing pipeline.

### The Goal

```
Parse document
      ↓
AI extracts WorkItem[]         (existing — extractInvoiceItems)
      ↓
AI classifies each item        (NEW — classifyWorkItemsForDictionary)
  ├─ High confidence match → tag with existing taskTypeSlug
  ├─ Medium confidence  →  flag for human review (suggest nearest task type)
  └─ Low confidence / no match → AI proposes new Task-Type entry to dictionary
      ↓
User reviews proposals (optional, for new entries only)
      ↓
Approved proposals written to orgSemanticRegistry (addOrgTaskType / addOrgSkillType)
      ↓
Dictionary is richer for the next parse → higher match confidence
      ↓  (repeat)
```

This is the **positive feedback loop**: every parsed document is an opportunity to teach the
system a new task type or confirm an existing one.

---

## 2. Current Architecture (Baseline)

### What exists today

| Component | Location | Role |
|---|---|---|
| `extractInvoiceItems` | `src/app-runtime/ai/flows/extract-invoice-items.ts` | OCR → `WorkItem[]` with `semanticTagSlug` (VS8 cost classification) |
| `suggestTaskTypeDraftFromAI` | `src/app-runtime/ai/flows/suggest-semantic-dictionary-entry.ts` | Manual prompt → draft task-type entry |
| `suggestSkillTypeDraftFromAI` | same file | Manual prompt → draft skill-type entry |
| `resolveOrgTaskTypeByItemName` | `src/features/organization.slice/gov.semantic/_registry.ts` | Exact name/alias string match against org task-type dictionary |
| `OrgTaskTypeEntry` / `OrgSkillTypeEntry` | `src/shared-kernel/types/organization-semantic.ts` | Dictionary entry types owned by VS4 |
| `orgSemanticRegistry/{orgId}/taskTypes/{slug}` | Firestore | Task-type Firestore collection |
| `orgSemanticRegistry/{orgId}/skillTypes/{slug}` | Firestore | Skill-type Firestore collection |
| `IEmbeddingPort` | `src/features/semantic-graph.slice/core/embeddings/embedding-port.ts` | Port for vector generation (dependency-inversion) |
| `VectorStore` | `src/features/semantic-graph.slice/core/embeddings/vector-store.ts` | In-session cosine-similarity store |

### What does NOT exist yet

- No Genkit flow that automatically classifies a `WorkItem` against the Task-Type Dictionary.
- No vector embeddings for task-type dictionary entries.
- No feedback path from parsing output back to the dictionary write API.
- No UI surface to review / approve AI-proposed dictionary entries post-parse.

---

## 3. Target Architecture — Positive Feedback Loop

```
                    ┌──────────────────────────────────────────┐
                    │          Document Upload (VS5)           │
                    └──────────────────┬───────────────────────┘
                                       │ OCR Document Object
                    ┌──────────────────▼───────────────────────┐
                    │   extractInvoiceItems (L10 Genkit)        │
                    │   Returns WorkItem[] + semanticTagSlug    │
                    └──────────────────┬───────────────────────┘
                                       │ WorkItem[]
                    ┌──────────────────▼───────────────────────┐
                    │  classifyWorkItemsForDictionary (L10)     │
                    │  Input: WorkItem[] + orgId                │
                    │  Reads: orgSemanticRegistry (task-types)  │
                    │  Algorithm:                               │
                    │    1. Exact / alias text match            │
                    │    2. Vector cosine similarity (VS8 port) │
                    │    3. LLM fallback — generate new draft   │
                    └──────┬─────────────────┬─────────────────┘
                           │                 │
              ┌────────────▼──┐   ┌──────────▼────────────────┐
              │ Matched items │   │ Unmatched items + AI draft │
              │ taskTypeSlug  │   │ DictionaryProposal[]       │
              └────────────┬──┘   └──────────┬────────────────┘
                           │                 │ (user review)
                           │       ┌─────────▼────────────────┐
                           │       │  User approves / edits   │
                           │       │  addOrgTaskType (VS4)     │
                           │       │  addOrgSkillType (VS4)    │
                           │       └─────────┬────────────────┘
                           │                 │
                    ┌──────▼─────────────────▼────────────────┐
                    │  orgSemanticRegistry  (Firestore)        │
                    │  taskTypes / skillTypes — enriched       │
                    └─────────────────────────────────────────┘
                                    (next parse: better match)
```

---

## 4. Data Model

### `OrgTaskTypeEntry` (existing, in `shared-kernel`)

```ts
interface OrgTaskTypeEntry {
  orgId: string
  slug: string           // e.g. "org:abc:task-type:low-voltage-wiring"
  name: string           // e.g. "低壓配線"
  aliases: string[]      // ["低壓線", "穿線工程"]
  description?: string
  active: boolean
  requiredSkills: SkillRequirement[]   // links to skill-type slugs
  addedBy: string
  addedAt: string
  updatedAt?: string
  // vector field (TO BE ADDED when implementing the loop)
  // embedding?: number[]   — stored via Firebase Vector Search or Vertex AI
}
```

### `DictionaryProposal` (new type to add)

A proposal is generated when classification fails to find a confident match.  It is a
transient object — never stored in its own collection.  Instead it is returned as part of the
classification result and displayed to the user for review.

```ts
interface DictionaryProposal {
  /** The original work item description that triggered this proposal. */
  itemDescription: string
  /** The proposed task-type draft (matches SuggestTaskTypeDraftOutput shape). */
  taskTypeDraft: {
    slug: string
    name: string
    aliases: string[]
    description?: string
    requiredSkills: SkillRequirement[]
  }
  /** Confidence that the proposal is useful (0–1). */
  confidence: number
  /** The source item indices from WorkItem[] that this proposal covers. */
  sourceIntentIndices: number[]
}
```

### `ClassifiedWorkItem` (new type to add)

```ts
interface ClassifiedWorkItem extends WorkItem {
  /** Set when a task-type match was found above the confidence threshold. */
  taskTypeSlug?: string
  /** Set when a task-type match was found. */
  taskTypeName?: string
  /** Skills inferred from the matched task-type entry. */
  requiredSkills?: SkillRequirement[]
  /** Classification confidence (0–1). 1 = exact match; lower = vector/AI match. */
  classificationConfidence: number
}
```

---

## 5. Classification Pipeline Detail

The classification function processes each `WorkItem` through three stages in order.
The first stage that returns a result above the confidence threshold wins.

### Stage 1 — Exact / Alias Text Match

```
resolveOrgTaskTypeByItemName(item.item, taskTypes)
```

Uses the existing `resolveOrgTaskTypeByItemName` in `gov.semantic/_registry.ts`.
This does case-insensitive exact matching on `name` and `aliases`.

- **Confidence**: `1.0` on exact name match, `0.9` on alias match.
- **Cost**: Zero — pure in-memory string comparison.
- **When to use**: Always the first gate.

### Stage 2 — Vector Cosine Similarity

When Stage 1 fails, embed the work item description using `IEmbeddingPort` and compare it
against pre-computed embeddings for each `OrgTaskTypeEntry` stored in the org's vector index.

```
const queryVector = await embeddingPort.embed(item.item)
const best = vectorStore.findMostSimilar(queryVector, taskTypeVectors)
// Returns { slug, similarity } where similarity ∈ [0, 1]
```

- **Confidence threshold**: `0.75` — items below this go to Stage 3.
- **Cost**: One embedding call per unmatched item (batch where possible).
- **Prerequisite**: Task-type entries must have pre-computed vectors. These are generated when
  an entry is added to the dictionary and stored on the entry (or in a separate projection).

### Stage 3 — LLM Fallback (Genkit)

When both Stage 1 and Stage 2 fail, call `suggestTaskTypeDraftFromAI` with the item
description as the `userPrompt` and the existing dictionary slugs as context.

```ts
const draft = await suggestTaskTypeDraftFromAI({
  orgId,
  userPrompt: item.item,
  existingTaskTypeSlugs: taskTypes.map(t => t.slug),
  existingSkillTypeSlugs: skillTypes.map(s => s.slug),
})
// → DictionaryProposal (pending user review)
```

- **Confidence**: `0.5` (AI-generated, unconfirmed).
- **Cost**: One LLM call per unmatched item (batch multiple items into one prompt where
  sensible to reduce cost).
- **Output**: A `DictionaryProposal` that must be reviewed by a human before writing to
  the dictionary.

### Confidence Summary

| Stage | Method | Confidence | Action |
|---|---|---|---|
| 1 | Exact name match | 1.0 | Tag immediately; no review needed |
| 1 | Alias match | 0.9 | Tag immediately; no review needed |
| 2 | Vector similarity ≥ 0.75 | 0.75–1.0 | Tag with confirmation toast |
| 2 | Vector similarity 0.5–0.75 | 0.5–0.75 | Flag for review, pre-fill form with match |
| 3 | LLM suggestion | 0.5 | Show proposal in review panel |
| — | No match + no suggestion | 0.0 | Show "uncategorised" warning |

---

## 6. Vector Strategy

### Where vectors are stored

Task-type and skill-type entries are stored in Firestore at:
```
orgSemanticRegistry/{orgId}/taskTypes/{slug}    ← OrgTaskTypeEntry
orgSemanticRegistry/{orgId}/skillTypes/{slug}   ← OrgSkillTypeEntry
```

The recommended strategy is to add an `embedding` field to each entry when a new entry is
created or updated.  This avoids a separate vector-database dependency and keeps the system
self-contained:

```
OrgTaskTypeEntry.embedding: number[]   // dense float vector from IEmbeddingPort
```

Alternatively (for scale), Firebase's [Vector Search extension](https://firebase.google.com/products/extensions)
or a dedicated Vertex AI Vector Search index can be used.

### When embeddings are generated

- **On entry creation** (`addOrgTaskType` / `addOrgSkillType`): generate embedding for
  `${entry.name} ${entry.aliases.join(' ')} ${entry.description ?? ''}` and store it on the
  document.
- **On entry update**: re-generate embedding if `name`, `aliases`, or `description` changed.
- **Bulk backfill**: run a one-time Cloud Function to generate embeddings for all existing
  entries after the infrastructure is wired.

### Embedding text convention

Follow the existing `tag::` URI convention from `semantic-utils.ts`:

```
// Tag embeddings:  tag::{category}/{slug} {label}
// Task-type embeddings (proposed convention):
dict::task-type/{slug} {name} {aliases joined by space} {description}
```

Using a different prefix (`dict::`) keeps these embeddings semantically distinct from VS8 tag
embeddings in a shared embedding space.

### Cosine similarity computation

The `VectorStore` in VS8 provides `computeCosineSimilarity(a, b)`.  For dictionary matching,
load all task-type vectors into a session `VectorStore` instance at the start of classification
(not the global module singleton) and compute similarity for each query.

```ts
const sessionStore = new VectorStore()
for (const entry of taskTypes) {
  if (entry.embedding && entry.embedding.length > 0) {
    sessionStore.storeEmbedding(entry.slug as TagSlugRef, entry.embedding)
  }
}
// Then for each work item:
const querySlug = `query:${item.sourceIntentIndex}` as TagSlugRef
sessionStore.storeEmbedding(querySlug, queryVector)
const best = taskTypes.reduce(
  (acc, entry) => {
    const sim = sessionStore.computeCosineSimilarity(querySlug, entry.slug as TagSlugRef)
    return sim > acc.similarity ? { entry, similarity: sim } : acc
  },
  { entry: null, similarity: 0 } as { entry: OrgTaskTypeEntry | null; similarity: number }
)
```

---

## 7. Genkit Flow: `classifyWorkItemsForDictionary`

### Proposed flow signature

```ts
// src/app-runtime/ai/flows/classify-work-items.ts
'use server'

export interface ClassifyWorkItemsInput {
  orgId: string
  workItems: WorkItem[]
  /** Pass the org's task-type entries to avoid a double Firestore read. */
  taskTypes: OrgTaskTypeEntry[]
  skillTypes: OrgSkillTypeEntry[]
}

export interface ClassifyWorkItemsOutput {
  classified: ClassifiedWorkItem[]
  proposals: DictionaryProposal[]   // pending human review
}

export async function classifyWorkItemsForDictionary(
  input: ClassifyWorkItemsInput
): Promise<ClassifyWorkItemsOutput>
```

### Registration checklist

When implementing this flow:

- [ ] Create `src/app-runtime/ai/flows/classify-work-items.ts`
- [ ] Add `ClassifyWorkItemsInput` / `ClassifyWorkItemsOutput` / `DictionaryProposal` / `ClassifiedWorkItem` schemas to `src/app-runtime/ai/schemas/`
- [ ] Import and register the flow in `src/app-runtime/ai/dev.ts`
- [ ] Export from `src/app-runtime/ai/index.ts`
- [ ] Update `src/app-runtime/ai/README.md`
- [ ] Add the classification step to the document parsing pipeline in `domain.document-parser`
- [ ] Expose the `DictionaryProposal[]` via the `DocumentParserItemsExtractedPayload` event

### Calling the flow from domain.document-parser

```ts
// domain.document-parser/_form-actions.ts  (after extractInvoiceItems completes)
const extraction = await extractInvoiceItems({ documentObject: ocrDocument })

// Load org dictionary (route through organization.slice barrel)
const [taskTypes, skillTypes] = await Promise.all([
  getOrgTaskTypes(orgId),
  getOrgSkillTypes(orgId),
])

const classification = await classifyWorkItemsForDictionary({
  orgId,
  workItems: extraction.workItems,
  taskTypes,
  skillTypes,
})

// classification.classified — items annotated with taskTypeSlug + requiredSkills
// classification.proposals  — new entries to propose to the user
```

---

## 8. User Feedback Integration

### Review surface

After the classification step, the workspace document parser should display a
`DictionaryProposalReviewPanel` (a new component in `domain.document-parser/_components/`)
that shows each unmatched item alongside the AI-generated draft task-type.  The user can:

- **Approve**: calls `addOrgTaskTypeAction(orgId, draft.slug, draft.name, userId, options)`
  → entry written to `orgSemanticRegistry` → embedding generated → dictionary enriched.
- **Edit then approve**: modifies slug/name/skills before confirming.
- **Dismiss**: item remains uncategorised for this parse (no dictionary change).

### Event flow for approved proposals

```
User approves proposal
  └─▶ addOrgTaskTypeAction (VS4 Server Action)
        └─▶ addOrgTaskType() — writes to orgSemanticRegistry/taskTypes
              └─▶ (future) generate embedding and update entry.embedding
```

The event bus should emit `org:taskType:added` (define in `organization.slice/core.event-bus`)
so that other slices (e.g. the classifier cache) can invalidate their in-memory dictionary copy.

### Feedback quality signals

Track the following to measure loop health:

| Signal | Meaning |
|---|---|
| `exactMatchRate` | % of items matched at Stage 1 — should grow over time |
| `vectorMatchRate` | % matched at Stage 2 |
| `proposalAcceptanceRate` | % of AI proposals approved by users |
| `newEntriesPerParse` | Average new entries added per document |

These can be written as Firestore documents or logged via the Observability layer (L9).

---

## 9. Implementing the Loop — Step-by-Step

Follow this sequence to implement the feedback loop from scratch:

### Phase 1 — Schema and types

1. Add `ClassifiedWorkItem`, `DictionaryProposal`, `ClassifyWorkItemsInput`, `ClassifyWorkItemsOutput` to `src/app-runtime/ai/schemas/`.
2. Add `embedding?: number[]` field to `OrgTaskTypeEntry` and `OrgSkillTypeEntry` in `src/shared-kernel/types/organization-semantic.ts`.

### Phase 2 — Vector infrastructure

3. Wire `IEmbeddingPort` with the Google Generative AI `text-embedding-004` model (or Vertex AI `textembedding-gecko`) at application bootstrap in `src/app-runtime/providers/`.
4. Update `addOrgTaskType` / `addOrgSkillType` in `gov.semantic/_registry.ts` to generate and store an embedding on creation/update.
5. Write a one-time migration Cloud Function to backfill embeddings for existing entries.

### Phase 3 — Classification flow

6. Implement `classifyWorkItemsForDictionary` in `src/app-runtime/ai/flows/classify-work-items.ts` using the three-stage pipeline described in [Section 5](#5-classification-pipeline-detail).
7. Register in `dev.ts` and export from `index.ts`.

### Phase 4 — Parsing pipeline integration

8. Call `classifyWorkItemsForDictionary` from `domain.document-parser/_form-actions.ts` after `extractInvoiceItems`.
9. Include `DictionaryProposal[]` in `DocumentParserItemsExtractedPayload`.

### Phase 5 — Review UI

10. Build `DictionaryProposalReviewPanel` in `domain.document-parser/_components/`.
11. Connect to `suggestOrgTaskTypeDraftAction` (pre-fills edit form) and `addOrgTaskTypeAction` (writes approved entry).

### Phase 6 — Measurement

12. Add telemetry events for the four feedback quality signals listed above.
13. Review match-rate metrics after 10+ parsed documents and tune the vector similarity threshold.

---

## 10. Architecture Compliance Rules

| Rule | Requirement |
|---|---|
| **D7** | Cross-slice imports through `index.ts` barrel only.  `domain.document-parser` reads from `@/features/organization.slice` — never from a sub-path. |
| **D21** | Tag/semantic logic stays in VS8 (`semantic-graph.slice`).  `VectorStore` and `IEmbeddingPort` remain owned by VS8. |
| **D24** | Genkit flows in `app-runtime/ai` must not import `firebase/*` directly.  Load task-type data via the Server Action that calls the flow, then pass it as input — do not fetch from Firestore inside a flow. |
| **D27** | Cost semantic decisions (cost-item-type) come from VS8, not the document parser.  `classifyWorkItemsForDictionary` resolves task-types (VS4 domain) — do not confuse this with VS8 cost classification. |
| **A8** | One aggregate per command.  `addOrgTaskTypeAction` writes one task-type entry per call.  Do not batch multiple approvals in a single command. |
| **L10** | Genkit flows belong to Layer L10 (AI Runtime).  Classification results are passed back to L2/L3 as data — flows never trigger Firestore writes directly. |

---

## See Also

- [`DEVELOPMENT.md`](../../DEVELOPMENT.md) — root development guide
- [`docs/development/workspace.slice-guide.md`](workspace.slice-guide.md) — workspace parsing pipeline
- [`src/features/organization.slice/gov.semantic/`](../../src/features/organization.slice/gov.semantic/) — VS4 dictionary owner
- [`src/app-runtime/ai/flows/suggest-semantic-dictionary-entry.ts`](../../src/app-runtime/ai/flows/suggest-semantic-dictionary-entry.ts) — existing AI draft flows
- [`src/features/semantic-graph.slice/core/embeddings/`](../../src/features/semantic-graph.slice/core/embeddings/) — IEmbeddingPort and VectorStore
- [`docs/architecture/00-logic-overview.md`](../architecture/00-logic-overview.md) — architecture SSOT
