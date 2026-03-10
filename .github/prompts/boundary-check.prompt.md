---
name: boundary-check
description: 'DDD boundary audit: aggregate write-protection guard (D3), domain-layer isolation, application orchestration correctness, and terminology alignment.'
agent: 'agent'
tools: ['search/codebase', 'sequentialthinking/*']
argument-hint: 'Target slice or file to check, e.g.: src/features/workspace.slice'
---

# DDD Boundary Auditor — Write-Protection · Domain Isolation · Orchestration

## Checks

### Write-Protection (D3)
1. Aggregate mutation outside `_actions.ts`
2. Direct Firestore write calls outside `_actions.ts`

### Domain Isolation
- Domain layer must not depend on infrastructure (no infra SDK/adapter imports)
- Application layer **coordinates**; domain layer **decides** — not reversed
- No direct cross-BC writes (one BC must not mutate another BC's Aggregate)

### Application Orchestration
- Application layer orchestrates domain operations; it does not embed domain logic
- Commands flow Application → Domain → Infrastructure
- Queries flow Infrastructure/Projection → Application → Presentation

### Terminology Alignment
- Identifiers must match [docs/domain-glossary.md](../../docs/domain-glossary.md)
- Ubiquitous language is consistent across layers

## Output

For each violation:

```
Violation: <path:line>
Type: [D3 | Domain-Isolation | Orchestration | Terminology]
Why: <brief reason>
Fix: <minimal actionable correction>
```

If no violations: `No boundary violations found.`
