# Architecture Audit — Open / In-Progress Issues

> **Source of truth**: `docs/logic-overview.md`  
> **Auditor**: 架構合規審計官 (Architectural Compliance Auditor)  
> **Audit date**: 2026-03-04  
> **Note**: Resolved items are migrated to `docs/management/issues-archive.md`.

---

## DOC-PARSER-D14-001 — Write Idempotency Failure in `saveParsingIntent` [D14/D15]

**ID**: #ISSUE-20260304-008  
**Rule**: D14 — Version-protected writes must be idempotent; D15 — Write consistency (no duplicate document creation)  
**Severity**: Critical  
**Status**: ✅ Fixed (this PR — commit `fix(D14/D15): add sourceFileId idempotency guard to saveParsingIntent`)

**Problem file**:
- `src/features/workspace.slice/business.document-parser/_intent-actions.ts`

**Root cause**:  
`saveParsingIntent` called `createParsingIntentFacade` (backed by `addDocument`) unconditionally on every invocation. When a user re-uploaded the same document — or when a network retry caused the caller to fire twice — a second distinct `ParsingIntent` document was created in Firestore for the same source file. Each redundant intent could trigger independent task-materialization import runs, causing **task duplication** in the workspace.

The `startParsingImport` ledger already had its own idempotency key guard, but upstream `saveParsingIntent` was the earlier entry point where duplication occurred.

**Fix applied**:  
1. Added `getParsingIntentBySourceFileId` to `workspace-business.document-parser.repository.ts` — queries `parsingIntents` subcollection filtered by `sourceFileId` and `status != 'superseded'`, ordered by `createdAt desc`, limit 1.  
2. Exported the new function through the `firestore.facade.ts` and the repositories `index.ts`.  
3. In `saveParsingIntent`, when `options.sourceFileId` is provided:
   - Query for an existing non-superseded intent.
   - **Same `semanticHash`**: return the existing intent immediately — no Firestore write (true idempotency).
   - **Different `semanticHash`**: the file was re-parsed; automatically set `previousIntentId` to supersede the old intent before creating the new one.
   - **No existing intent**: proceed with `createParsingIntentFacade` as before.

```ts
// ✅ D14/D15 compliant — idempotency guard added
if (options?.sourceFileId) {
  const existing = await getParsingIntentBySourceFileIdFacade(workspaceId, options.sourceFileId)
  if (existing) {
    if (existing.semanticHash === semanticHash) {
      return { intentId: existing.id as IntentID }          // no-op, same content
    }
    options = { ...options, previousIntentId: existing.id as IntentID }  // auto-supersede
  }
}
```

---

## BUG-冪等性失效：Document Parser 重複導入導致 Task 翻倍

**ID**: #BUG-20260304-001  
**Rules violated**: [D14] Source-based De-duplication, [D15] Version Guard / Write-once Semantics  
**Severity**: Critical  
**Status**: ✅ Fixed (this PR)

### Problem

`/document-parser` — "Import as Root Tasks" button causes tasks to double (or multiply) every time the same `ParsingIntent` is imported more than once.

### Root Cause (TOCTOU Race)

`importItems()` in `use-workspace-event-handler.tsx` contained only an **async** deduplication guard:

1. `hasTasksForSourceIntent(workspace.id, payload.intentId)` — async Firestore read
2. `startParsingImport(...)` — async Firestore read-then-write

Because both guards are **asynchronous**, two concurrent calls to `importItems()` (e.g. double-click, React StrictMode double-invoke, or the same `DocumentParserItemsExtracted` event delivered twice) both pass the read check before either has committed any writes, and each proceeds to write a full set of tasks — a classic **Time-of-Check / Time-of-Use (TOCTOU)** race condition.

### Violated Rules

| Rule | Description | How it was violated |
|------|-------------|---------------------|
| [D14] | Source-based De-duplication must prevent re-writing tasks for the same `sourceIntentId` | No synchronous gate existed; the async `hasTasksForSourceIntent` check could be bypassed under concurrency |
| [D15] | Write operations must be idempotent; duplicate writes must be detected before reaching Firestore | `startParsingImport` idempotency key check is also async — non-atomic under parallel calls |

### Fix Applied

Added a **synchronous in-memory idempotency lock** (`inProgressImports: useRef<Set<string>>`) in `use-workspace-event-handler.tsx`:

```ts
// [D14] Synchronous in-memory guard — fires before any async Firestore I/O.
if (inProgressImports.current.has(payload.intentId)) {
  toast({ title: "Import In Progress", ... });
  return;
}
inProgressImports.current.add(payload.intentId);

// (full async chain: hasTasksForSourceIntent → startParsingImport → createTask × N, omitted for brevity)
hasTasksForSourceIntent(...)
  .then((alreadyImported) => {
    // ... existing async Firestore guards + task writes ...
  })
  .finally(() => {
    inProgressImports.current.delete(payload.intentId);
  });
```

The lock is:
- **Acquired synchronously** at the very start of `importItems()` — before any `await` / `.then()` — so two concurrent calls cannot both pass it.
- **Released unconditionally** in `.finally()` so a future legitimate import is never permanently blocked by a prior error.

The pre-existing async guards (`hasTasksForSourceIntent` and `startParsingImport` idempotency key) remain as a **defence-in-depth** second layer for cross-session or cross-device duplicate prevention.

### Files Changed

- `src/features/workspace.slice/core/_hooks/use-workspace-event-handler.tsx` — added `useRef` import, `inProgressImports` ref, synchronous guard, and `.finally()` cleanup.

---

## Audit Summary — 2026-03-04 (Updated)

| Issue ID | File(s) | Rule | Severity | Status |
|---|---|---|---|---|
| #ISSUE-20260304-008 | `workspace.slice/business.document-parser/_intent-actions.ts` | D14/D15 | Critical | ✅ Fixed |

**Resolved items** (#ISSUE-20260304-001 through #ISSUE-20260304-007) have been migrated to `docs/management/issues-archive.md`.
