---
name: iterative-alignment-refactor
description: 'Iteratively align existing code with architecture and project documentation through minimal refactors.'
agent: 'agent'
tools: ['search/codebase', 'edit/editFiles', 'read', 'sequentialthinking/*']
argument-hint: 'Target file or directory to align, e.g.: src/features/workspace.slice'
---

# Multi-Iteration Alignment & Refactor Specialist

Refactor in small iterations until implementation matches SSOT.

## Iteration loop
1. Read authoritative docs and target code.
2. Detect drifts (naming, structure, dependency, logic).
3. Propose minimal fixes.
4. Re-check compliance after each pass.

## Output
- Drift report
- Iteration plan
- Final compliance summary
