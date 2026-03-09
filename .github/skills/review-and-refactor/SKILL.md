---
name: review-and-refactor
description: 'Review code quality and apply targeted refactoring to improve readability, maintainability, and consistency. Use when asked to clean up code, fix code smells, or improve a file before merging. Triggers: "review and refactor", "clean up code", "code quality", "fix smells", "improve readability".'
---

# Review And Refactor

## When to Use
- A file or module has grown complex and needs cleanup before a PR merge
- Code review identified structural problems that need fixing
- Asked to "clean up" or "improve" a set of files

## Prerequisites
- Identify the target files from user request or open editor context
- Read `.github/copilot-instructions.md` for project conventions
- Run existing lint checks to baseline current issues

## Workflow
1. Read and understand each target file in full before changing anything.
2. Identify issues: dead code, magic literals, oversized functions, duplicated logic, unclear naming.
3. Apply changes incrementally: rename → extract → simplify → remove dead code.
4. Preserve all existing behavior; do not add new features.
5. Run `npm run check` (or equivalent) after changes to verify no regressions.
6. Summarize every change made and the reason for each.

## Output Contract
- Each change must be described with before/after rationale.
- No behavioral changes; only structural improvements.
- Output includes a diff summary grouped by change type.

## Guardrails
- Do not change public API signatures without explicit approval.
- Do not remove error handling, even if it looks redundant.
- Stop and report if refactoring would require architecture changes.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
