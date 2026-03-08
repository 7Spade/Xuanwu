---
name: boundary-check
description: 'Aggregate write-protection guard for D3: mutations must stay in `_actions.ts`.'
agent: 'agent'
---

# Aggregate Write-Protection Guard

Find write-boundary violations.

## Checks
1. Aggregate mutation outside `_actions.ts`
2. Direct Firestore write calls outside `_actions.ts`

## Output format
- `Violation: <path:line>`
- `Rule: D3`
- `Why: <brief reason>`
- `Fix: move to corresponding _actions.ts`
