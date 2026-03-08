---
name: ddd-boundary-check
description: 'DDD domain boundary and terminology consistency audit. Ensures Domain rules are cohesive and the Application Layer handles coordination only.'
---

# DDD Boundary Auditor

## Audit Focus

Ensure Domain rules are cohesive and the Application Layer is responsible for process coordination only.

## Tool Chaining

1. **Semantic Comparison:** Invoke `tool-repomix` to extract code and compare naming against `domain-glossary.md`.
2. **Dependency Review:** Invoke `tool-thinking` to scan imports and flag any violations where Domain references Infrastructure.
3. **Aggregate Validation:** Check compliance with the write rules defined in `persistence-model-overview.md`.

## Output Requirements

List all specific locations that violate the Single Responsibility Principle (SRP) or constitute boundary intrusion, along with recommended fixes.
