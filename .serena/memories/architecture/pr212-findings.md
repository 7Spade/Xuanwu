# PR #212 — Research Findings

## PR Summary
- **PR**: #212 in 7Spade/xuanwu — **DRAFT, not merged**
- **Title**: feat: align src codebase to docs/architecture/README.md (L1–L9)
- **Branch**: `copilot/add-serena-memories-documentation` → `main`
- **8 commits**, Copilot SWE agent + 7Spade, dated 2026-03-11~12

## What PR #212 Did (confirmed by commits + PR body)
1. Created `.serena/memories/README.md` (memory library file tree plan)
2. Fixed all architecture SSOT path refs from old numbered files
3. Migrated VS8 SemanticBrain arch doc paths to `docs/architecture/README.md`
4. Updated `session-inject.js` SSOT ref from `00-logic-overview.md` → `docs/architecture/README.md`
5. Removed "current status" notes from architecture README
6. Added `src/shared-kernel/ports/`, `errors/`, `state-machines/` (L9 port contracts, OptimisticLockException, state transition tables)
7. Migrated status enums; fixed SKILL_XP_MAX 525→524

## CONFIRMED: Old filenames fully absent from codebase
No grep hits for: `00-logic-overview.md`, `01-logical-flow.md`, `02-governance-rules.md`, `03-infra-mapping.md`, `00-architecture-standards.md`, `03-Slices/VS8-SemanticBrain/`

## Remaining Misalignments (on current branch)

### 🔴 CRITICAL — Wrong layer claims
1. **`.github/skills/x-framework-guardian/SKILL.md`**
   - Line 7: "validate a feature's logic chain against the **L0→L5** canonical flow" — docs/architecture/README.md defines L1→L9 docs layers, not L0→L5
   - Line 34: `驗證某 Slice 的邏輯流向是否符合 L0→L3→L4→L5`
   - **Line 102**: `它是否嚴格遵守 docs/architecture/README.md 定義的 L0 -> L3 -> L4 -> L5 流程？` — **Actively false**: docs/architecture/README.md does NOT define L0 runtime flow
   - Lines 22–23: SSOT table has the **same URL** in both rows (copy-paste error — should point to two distinct SSOTs)

2. **`src/shared-kernel/README.md`** line 3:
   - `對齊 docs/architecture/README.md 的 L1（Shared Kernel）定義`
   - docs/architecture/README.md L1 = `use-case-diagram-saas-basic.md` (Platform use-cases), NOT Shared Kernel
   - The L1=Shared Kernel mapping comes from the OLD runtime layer scheme

### 🟡 STALE SOURCE FILE REFERENCES
3. **`src/shared-infra/external-triggers/_guard.ts`** line 6: `Per logic-overview_v1.md L0 · External Triggers`
4. **`src/shared-infra/external-triggers/index.ts`** line 6: `Per logic-overview_v1.md L0 · External Triggers`
   → `logic-overview_v1.md` no longer exists; reference should point to `docs/architecture/README.md`

### 🟡 KNOWLEDGE GRAPH AMBIGUITY
5. **`.memory/knowledge-graph.json`** — `L_Category` entity:
   - `"Layer pipeline: L0 External Triggers → L1 Shared Kernel → L2 Command Gateway → L3 Domain Slices → L4 IER → L5 Projection Bus → L6 Query Gateway → L7 Firebase ACL → L8 Firebase Infra → L9 Observability."`
   - This is the **runtime** L-scheme; conflicts with docs/architecture/README.md L1–L9 meaning
   - `D_Category` has: `"D27 Type Truth: All domain entities must be defined in L1 Shared Kernel (SK_DATA)"` — same ambiguity

### 🟡 DIFFERENT L-SCHEMES IN SOURCE (possibly intentional but undocumented)
6. `src/app/README.md` — uses runtime L0 External Triggers → L2 scheme
7. `src/features/README.md` — uses runtime L0 External Triggers → L2 scheme
8. `architecture.md` (root) — uses Semantic-Kernel-Protocol L0/L0A/L0B/L3/L4/L4A/L5/L6/L8/L10

## Two-Layer-Scheme Root Cause
- **docs/architecture/README.md** (L1→L9) = document/design hierarchy (use-case → infra-spec)
- **legacy logic-overview_v1** (L0→L9) = runtime/processing pipeline (triggers → observability)
- **Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md** = Genkit matching protocol with its own numbering
- None of these systems is documented as distinct; agents conflate them
