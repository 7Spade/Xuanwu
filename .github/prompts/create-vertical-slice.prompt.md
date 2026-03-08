---
name: create-vertical-slice
description: 'Vertical Slice implementation guide. Build independent slices ensuring clear UI, Application, Domain, and Infrastructure boundaries.'
---

# Vertical Slice Implementation Guide

## Task Guidelines

Create an independent slice based on requirements, ensuring clear boundaries among UI, Application, Domain, and Infrastructure layers.

## Tool Collaboration Workflow

1. **Current State Scan:** Invoke `tool-repomix` to confirm the new feature's position in `project-structure.md`.
2. **UI Construction:** Invoke `tool-shadcn` to ensure only compositional design and Radix primitives are used.
3. **Logic Derivation:** Invoke `tool-thinking` to define the Command/Event flow direction and ensure no circular dependencies are introduced.
4. **Technical Reference:** If Next.js new features are involved, invoke `tool-context7` for authoritative documentation.

## Success Criteria

- Code structure conforms to `docs/project-structure.md`.
- Write boundaries comply with Aggregate root constraints; no cross-BC direct writes.
