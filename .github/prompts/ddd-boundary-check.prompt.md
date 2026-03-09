---
name: ddd-boundary-check
description: 'DDD boundary and terminology audit for domain cohesion and application-layer orchestration.'
agent: 'agent'
tools: ['search/codebase', 'sequentialthinking/*']
---

# DDD Boundary Auditor

Audit domain boundaries and role separation.

## Verify
- Domain layer does not depend on infrastructure
- Application layer coordinates, domain layer decides
- Terminology matches project glossary
- Aggregate write rules are preserved

## Output
- Violations (`path:line`)
- Boundary type
- Minimal fix recommendation
