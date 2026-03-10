---
name: xuanwu-orchestrator
description: 'Route a cross-functional Xuanwu task to the right project-specific workflow across product, research, architecture, implementation, UI, docs, ops, quality, and diagnostics.'
agent: 'xuanwu-orchestrator'
argument-hint: 'Describe the outcome you need, e.g.: ship workspace audit flow | plan and implement a new scheduling feature'
---

# Xuanwu Orchestrator

Use this as the default Xuanwu slash command when a task spans multiple functions or the right specialist is not obvious yet.

## Modes

1. **Plan & scope** — delegate requirement shaping and phased planning.
2. **Research & design** — collect context, docs, and architecture direction.
3. **Build & verify** — route implementation, UI, quality, docs, ops, and browser diagnostics in the correct order.

## Required behavior

- Start with the smallest correct handoff.
- Keep work aligned with the project-specific `xuanwu-*` agent suite.
- Return the recommended execution path when the task should be split.

Task: ${input:task:Describe the cross-functional task}
