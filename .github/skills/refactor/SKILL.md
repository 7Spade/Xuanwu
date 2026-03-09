---
name: refactor
description: 'Surgical code refactoring to improve maintainability without changing behavior. Use when extracting functions, renaming variables, breaking down god functions, improving type safety, eliminating code smells, or applying design patterns. Triggers: "refactor", "clean up code", "extract method", "code smell", "improve maintainability".'
---

# Refactor

## When to Use
- Extracting a reusable function from duplicated logic
- Renaming a variable, function, or type for clarity
- Breaking a god function into focused helpers
- Improving type safety by replacing `any` with proper types
- Eliminating code smells: magic numbers, deep nesting, feature envy

## Prerequisites
- Identify the target file(s) and the specific code to refactor
- Confirm tests exist to verify behavior before and after
- Understand the public API surface that must not change

## Workflow
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

## Output Contract
- Each change must be labeled with its refactoring type (Extract / Rename / Inline / Simplify).
- Behavioral equivalence must be verifiable by existing tests.
- Output a summary table: file → change type → rationale.

## Guardrails
- Do not change behavior — pure structural changes only.
- Do not rename public API symbols without explicit approval.
- Do not introduce new dependencies during refactoring.
- Stop and report if any change cannot be verified by an existing test.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
