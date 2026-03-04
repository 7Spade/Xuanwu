# Issue Log

## Open Issues

---

### #BUG-冪等性失效：Document Parser 重複導入導致 Task 翻倍

**Status:** Fixed  
**Severity:** High  
**Violated Rules:** [D14] Version Guard / Source-Pointer Immutability, [D15] Command-Query Separation  
**Reported:** 2026-03-04  
**Fixed:** 2026-03-04

#### Root Cause

The `importItems()` handler in `use-workspace-event-handler.tsx` called `createTask()` for every
item in `DocumentParserItemsExtractedPayload` without first checking whether tasks sourced from
the same `intentId` already existed in Firestore.  In React StrictMode (and on user double-click)
the event fires twice, producing duplicate `WorkspaceTask` documents.

The existing `parsingImports` ledger idempotency check (`startParsingImport`) was the **second**
line of defence, but it was reached only after the duplicate tasks had already been written when
the first import was still in-flight or when the ledger write itself raced.

#### Violated Rules

| Rule | Description |
|------|-------------|
| [D14] | Version Guard — writes to the `tasks` projection must validate whether the source pointer already produced output before writing new documents. |
| [D15] | Command-Query Separation — read queries must be placed in `_queries.ts`; the deduplication guard is a read-before-write pattern that belongs there. |

#### Fix: Source-based De-duplication

**Files changed:**

| File | Change |
|------|--------|
| `src/shared/infra/firestore/repositories/workspace-business.tasks.repository.ts` | Added `getTaskBySourceIntentId(workspaceId, intentId)` — queries `tasks` subcollection filtered by `sourceIntentId == intentId`, returns first match or `null`. |
| `src/shared/infra/firestore/firestore.facade.ts` | Re-exported `getTaskBySourceIntentId` from the facade so higher layers do not import the repository directly (D3). |
| `src/features/workspace.slice/business.tasks/_queries.ts` | Added `hasTasksForSourceIntent(workspaceId, intentId): Promise<boolean>` — thin wrapper that resolves `true` when `getTaskBySourceIntentId` returns a non-null result. |
| `src/features/workspace.slice/business.tasks/index.ts` | Exported `hasTasksForSourceIntent` as part of the public API of `business.tasks`. |
| `src/features/workspace.slice/core/_hooks/use-workspace-event-handler.tsx` | Before entering the `parsingImports` ledger check, calls `hasTasksForSourceIntent` and short-circuits with an "Already Imported" toast if tasks already exist for the given intent. |
| `src/shared/infra/firestore/repositories/workspace-business.tasks.repository.test.ts` | Added two unit tests for `getTaskBySourceIntentId`: happy path and null return for missing data. |

#### Idempotency Strategy

```
importItems()
  └─ hasTasksForSourceIntent(workspaceId, intentId)   ← NEW: source-based guard
       ├─ alreadyImported=true  → toast "Already Imported", return early
       └─ alreadyImported=false
            └─ startParsingImport(…)                  ← existing ledger guard
                 ├─ isDuplicate → return early
                 └─ proceed → createTask × N
```

Two complementary guards now protect against duplicates:
1. **Source guard** (new): asks "do tasks from this intent already exist in the projection?"
2. **Ledger guard** (existing): asks "has this import operation already been recorded as started/applied?"
