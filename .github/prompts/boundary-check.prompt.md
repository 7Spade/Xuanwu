---
name: boundary-check
description: 'Aggregate write-protection guard. Scans for D3 rule violations where Aggregates are mutated outside _actions.ts.'
---

# Aggregate Write-Protection Guard

## Task

Execute an Aggregate Write Protection Guard audit:

1. **Locate all D3 violations:** Identify every location that modifies an Aggregate outside of `_actions.ts`.
2. **Locate direct Firestore writes:** Flag any location outside `_actions.ts` that calls Firestore write operations directly.
3. **Generate a violation list:** Output a list of all non-compliant locations, including file path, line number, and violation description.

## Tool Usage

1. Invoke **`tool-repomix`** to scan the `src/features/` directory.
2. Invoke **`tool-thinking`** to analyze dependency chains and confirm true violations vs. false positives.

## Output Format

```
Violation: [file path:line number]
Rule: D3 — Mutation outside _actions.ts
Description: [brief description of the violation]
Fix: Move this logic into the corresponding _actions.ts
```
