---
description: 'Guidelines for structuring code and projects to maximize GitHub Copilot effectiveness through better context management'
applyTo: '**'
---

# Context Engineering Rules

Use these rules to maximize codebase context quality for Copilot.

## Structure Rules

- MUST use descriptive file paths that reveal feature intent.
- MUST colocate related code, tests, and types so one search pattern finds the full slice.
- MUST export only public contracts from index files and keep internals unexported.

## Code Context Rules

- SHOULD prefer explicit types on public functions and module boundaries.
- MUST use semantic names for variables, functions, and types.
- SHOULD replace magic numbers and strings with named constants.

## Prompting Rules

- SHOULD keep the most relevant files open while working on a feature.
- SHOULD place the cursor near the code area where help is needed.
- MUST describe multi-file scope before requesting complex changes.
- SHOULD reference an existing file pattern when asking for similar implementation.

## Change Execution Rules

- MUST complete dependency chains by architecture slice, not by tiny isolated diffs.
- MUST prioritize correctness and boundary compliance over minimal patch size.
- SHOULD ask for missing context before attempting high-risk refactors.

## Recovery Rules

- If output is generic, MUST add constraints, frameworks, and concrete file references.
- If suggestions are stale, SHOULD reopen related files and restate current intent.
