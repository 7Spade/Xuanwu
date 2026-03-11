---
name: refactor
description: 'Surgical code refactoring and quality review to improve maintainability without changing behavior. Use when extracting functions, reducing method cognitive complexity, renaming variables, breaking down god functions, improving type safety, eliminating code smells, reviewing code quality before merge, or applying design patterns. Triggers: "refactor", "clean up code", "extract method", "reduce complexity", "simplify method", "extract helpers", "cognitive complexity", "code smell", "improve maintainability", "review and refactor", "code quality", "fix smells", "improve readability".'
---

# Refactor

## Consolidation Status
- Canonical skill for both refactor execution and refactor planning mode.
- Backward-compatible alias: `../refactor-plan/SKILL.md`.

## When to Use

**Refactor mode** — structural cleanup of specific code patterns:
- Extracting a reusable function from duplicated logic
- Renaming a variable, function, or type for clarity
- Breaking a god function into focused helpers
- Improving type safety by replacing `any` with proper types
- Eliminating code smells: magic numbers, deep nesting, feature envy

**Review & Refactor mode** — broader quality pass before merge:
- A file or module has grown complex and needs cleanup before a PR merge
- Code review identified structural problems that need fixing
- Asked to "clean up" or "improve" a set of files

**Method Complexity Reduce mode** — targeted cognitive complexity reduction:
- A linter or review flags a method as exceeding complexity threshold
- A function has deep nesting or mixed concerns that hurt readability/testability
- Asked to "simplify this method" while preserving behavior

## Prerequisites
- Identify the target file(s) and the specific code to refactor
- Confirm tests exist to verify behavior before and after
- Understand the public API surface that must not change
- In review mode: read `.github/copilot-instructions.md` for project conventions and run existing lint checks to baseline current issues

## Workflow

### Focused Refactor
1. Read the full target file to understand context before changing anything.
2. Identify the specific code smell or improvement opportunity.
3. Apply one refactoring operation at a time:
   - **Extract**: move logic into a named function or variable
   - **Rename**: update symbol to communicate intent clearly
   - **Inline**: remove unnecessary indirection if it obscures intent
   - **Simplify**: replace complex conditionals with guard clauses or early returns
4. Run tests and type-check after each operation — do not batch unverified changes.
5. Review that the public API, types, and exports are unchanged.
6. Summarize every change with its category and rationale.

### Review & Refactor Pass
1. Read and understand each target file in full before changing anything.
2. Identify issues: dead code, magic literals, oversized functions, duplicated logic, unclear naming.
3. Apply changes incrementally: rename → extract → simplify → remove dead code.
4. Preserve all existing behavior; do not add new features.
5. Run `npm run check` (or equivalent) after changes to verify no regressions.
6. Summarize every change made and the reason for each.

### Method Complexity Reduce Pass
1. Identify the method name, current complexity score, and target threshold.
2. Read the full method and split it into logical sub-tasks.
3. Extract candidates incrementally (guard clauses, branch blocks, repeated logic) into named helpers.
4. Re-score complexity after each extraction and stop when the threshold is met.
5. Run targeted tests and type-check to verify behavior remains unchanged.
6. Report before/after complexity scores and any follow-up extraction needed.

## Output Contract
- Each change must be labeled with its refactoring type (Extract / Rename / Inline / Simplify / Remove).
- Behavioral equivalence must be verifiable by existing tests.
- Output a summary table: file → change type → rationale.
- Include a diff summary grouped by change type for review passes.
- For complexity-reduction tasks, include before/after cognitive complexity scores.

## Guardrails
- Do not change behavior — pure structural changes only.
- Do not rename public API symbols without explicit approval.
- Do not introduce new dependencies during refactoring.
- Do not remove error handling, even if it looks redundant.
- Stop and report if any change cannot be verified by an existing test or would require architecture changes.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
