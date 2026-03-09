---
name: "Context Engineering Rules"
description: "Context engineering rules for producing precise, architecture-aligned Copilot outputs."
applyTo: "**/*.{ts,tsx,js,jsx,css,md,json,yml,yaml}"
---

# Context Engineering Rules

## Repository Structure

- MUST use descriptive paths that communicate feature intent.
- MUST colocate code, tests, and types for each architecture slice.
- MUST export only public contracts from index files.

## Code Context Quality

- MUST use semantic names for variables, types, and functions.
- SHOULD add explicit types on public boundaries.
- SHOULD replace magic values with named constants.

## Prompt and Task Framing

- MUST describe multi-file scope before requesting complex edits.
- SHOULD reference an existing in-repo implementation pattern.
- SHOULD keep relevant files open and place cursor near target code.

## Change Execution

- MUST complete dependency chains by slice, not by disconnected micro-diffs.
- MUST prioritize correctness and boundary compliance over tiny patch size.
- SHOULD ask for missing context before high-risk refactors.

## Recovery

- MUST add explicit constraints and file references when output is generic.
- SHOULD restate current intent and reopen related files when suggestions become stale.
