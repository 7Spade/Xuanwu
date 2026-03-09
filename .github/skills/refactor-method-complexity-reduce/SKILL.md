---
name: refactor-method-complexity-reduce
description: 'Reduce cognitive complexity of a method by extracting helper methods and simplifying control flow. Use when a method exceeds the project complexity threshold, has deeply nested conditionals, or is flagged as too complex by a linter. Triggers: "reduce complexity", "simplify method", "extract helpers", "complexity too high", "cognitive complexity".'
argument-hint: "[method-name] [complexity-threshold]"
---

# Refactor Method Complexity Reduce

## When to Use
- A method is flagged by ESLint/SonarQube as exceeding the cognitive complexity threshold
- A function has more than three levels of nesting or multiple early-return branches
- A method is difficult to unit-test due to interleaved concerns

## Prerequisites
- Identify the method name and its current cognitive complexity score
- Confirm the target complexity threshold (project default or user-specified)
- Ensure tests exist to verify behavior before refactoring

## Workflow
1. Read the full method and identify logical sub-tasks within it.
2. Score the current cognitive complexity using the same metric as the linter.
3. Identify extraction candidates: guard clauses, loop bodies, condition branches, repeated logic.
4. Extract each candidate into a named helper method with a descriptive name.
5. Replace each extracted block in the original method with a call to the helper.
6. Re-score the complexity after each extraction — stop when the threshold is met.
7. Run tests to verify behavior is unchanged.
8. Check that each helper method is independently readable and testable.

## Output Contract
- Produce the refactored method and all extracted helpers.
- Include before/after complexity scores.
- Flag any extracted helper that still exceeds the threshold for a follow-up extraction.

## Guardrails
- Do not change behavior while extracting — pure structural refactoring only.
- Do not inline variables just to reduce line count without improving clarity.
- Stop and report if a method cannot be refactored below the threshold without behavioral changes.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
