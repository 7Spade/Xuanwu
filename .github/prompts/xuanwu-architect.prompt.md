---
name: xuanwu-architect
description: 'Design or audit Xuanwu architecture: vertical slices, boundary compliance, remediation, legacy decoupling, logic design, and performance-sensitive structural changes.'
agent: 'xuanwu-architect'
argument-hint: 'Target path or architecture task, e.g.: src/features/workspace.slice | design new reporting slice'
---

# Xuanwu Architecture Workflow

This prompt is the canonical architecture workflow for Xuanwu.

## Modes

1. **Architecture audit** — check layer direction, slice boundaries, naming drift, and path integrity.
2. **Architecture remediation** — plan phased fixes for drift, violations, or legacy coupling.
3. **Vertical slice design** — define boundary, file tree, public API, and responsibilities for a new slice.
4. **Logic design / review** — produce correctness-first design guidance for risky changes.
5. **Performance-sensitive architecture** — review structural bottlenecks that require design-level optimization.

## Guardrails

- Base compliance decisions on repository SSOT documents.
- Prefer minimal, reviewable remediation plans over speculative rewrites.
- Escalate documentation-only work to `xuanwu-docs` when code changes are not required.

Task: ${input:task:Describe the architecture task}
