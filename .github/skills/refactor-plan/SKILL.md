---
name: refactor-plan
description: 'Plan a safe, sequenced multi-file refactor with dependency order, rollback checkpoints, and verification steps. Use before starting a large-scale refactor, migrating architecture patterns, or restructuring modules. Triggers: "plan refactor", "refactor roadmap", "multi-file refactor", "refactor sequence".'
---

# Refactor Plan

## When to Use
- About to start a refactor spanning more than three files
- Need to coordinate order of changes to avoid broken intermediate states
- Architecture migration requires rollback safety at each phase

## Prerequisites
- Define the goal and scope: which files, which pattern to change
- Identify all callers and dependents of the code being moved/renamed
- Confirm tests exist to verify behavior after each phase

## Workflow
1. Build a dependency graph of all files in scope.
2. Produce a move-map: `source → destination` for each file or symbol.
3. Sequence operations bottom-up (leaf dependencies first).
4. Define a rollback checkpoint after every batch of ≤5 file changes.
5. Specify the verification command (lint + typecheck + tests) for each checkpoint.
6. Flag destructive operations (renames, deletes) and require explicit confirmation before executing.
7. Document assumptions, risks, and follow-up work.

## Output Contract
- Output a phased plan with: Phase → Files → Operations → Rollback Step → Verification.
- Each phase must be independently verifiable before proceeding to the next.
- Include a risk register for non-reversible changes.

## Guardrails
- Do not move more than 5 files per batch without a checkpoint.
- Do not create barrel-only pseudo-layers before real file moves compile.
- Stop and report if a phase cannot be verified safely.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
