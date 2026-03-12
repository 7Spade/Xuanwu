# PR #212 — Architecture Alignment Findings (COMPLETED)

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
No grep hits for: `00-logic-overview.md`, `01-logical-flow.md`, `02-governance-rules.md`, `03-infra-mapping.md`, `00-architecture-standards.md`, `03-Slices/VS8-SemanticBrain/`, `logic-overview_v1.md`

## Two-Layer-Scheme Root Cause (Documented)
There are two distinct L-numbering systems in this repository — they must NOT be conflated:

| System | L1 means | L9 means | Origin |
|--------|----------|----------|--------|
| **docs/architecture/README.md** documentation hierarchy | `use-case-diagram-saas-basic.md` (Platform Use Cases) | `guidelines/infrastructure-spec.md` | Current SSOT |
| **Runtime pipeline** (formerly logic-overview_v1) | Shared Kernel / CBG | Observability | src/features/README.md, knowledge-graph.json L_Category |

A disambiguation note has been added to `.memory/knowledge-graph.json` `L_Category` to make this explicit.

## Fixes Applied (this session)

### ✅ FIXED — `.github/skills/x-framework-guardian/SKILL.md`
- Description: removed false "L0→L5 canonical flow" attribution to docs/architecture/README.md
- SSOT table: fixed duplicate rows (now row 1 = `src/features/README.md`, row 2 = `docs/architecture/README.md`)
- Init prompt: fixed duplicate "docs/architecture/README.md 與 docs/architecture/README.md" → "src/features/README.md 與 docs/architecture/README.md"
- Full-audit prompt: same fix
- Boundary Audit ref: `§4.1` → `src/features/README.md — Slice Autonomy Rules`
- Migration Audit ref: `§7.1+§7.2` → `src/features/README.md — Intra-Slice Directory Convention`
- Bootstrap ref: `§8` → `src/features/README.md — Intra-Slice Directory Convention`
- Logic-chain prompt: removed false attribution of `L0 → L3 → L4 → L5` to `docs/architecture/README.md`; clarified as runtime pipeline
- Related resources: fixed duplicate links (`命名規範 SSOT` → `src/features/README.md`)

### ✅ FIXED — `src/shared-kernel/README.md`
- Heading changed from `L1 · VS0` to `VS0 · 運行時管線 L1`
- Line 3 now explicitly disambiguates: runtime pipeline L1 ≠ docs/architecture/README.md L1

### ✅ FIXED — `src/shared-infra/external-triggers/_guard.ts`
- Replaced `logic-overview_v1.md` → `docs/architecture/README.md · External Triggers (runtime pipeline L0)`

### ✅ FIXED — `src/shared-infra/external-triggers/index.ts`
- Same fix as `_guard.ts`

### ✅ FIXED — `.memory/knowledge-graph.json`
- Added disambiguation observation to `L_Category`: runtime L0-L9 pipeline ≠ docs/architecture L1-L9 doc hierarchy
