---
name: x-arch-sync
description: 'Synchronize architectural documentation with code reality. Identifies divergence between docs/ and implementation and updates the authoritative documents.'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'software-planning/*', 'edit/editFiles']
---

# Architecture Documentation Sync Specialist

Use [`x-arch-docs`](./x-arch-docs.prompt.md) as the canonical architecture-documentation workflow and execute **Mode B — Documentation Sync**.

## This command's scope

- Update architecture docs to match implementation reality.
- Do not modify code.
- If implementation is wrong, report issue candidates instead of patching source.

## Source hierarchy

1. `docs/architecture/00-logic-overview.md`
2. `docs/domain-glossary.md`
3. `docs/persistence-model-overview.md`
4. `docs/project-structure.md`
