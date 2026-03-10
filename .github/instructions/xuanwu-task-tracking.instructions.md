---
name: "Xuanwu Task Tracking Rules"
description: "Project-specific rules for implementing tracked plans and keeping task progress documents synchronized with reality."
applyTo: "**/.copilot-tracking/**/*.md"
---

# Xuanwu Task Tracking Rules

## Execution

- MUST read the full plan and matching details before implementation.
- MUST execute tasks in plan order unless a documented deviation is required.
- MUST implement complete working behavior, not partial scaffolding.

## Tracking

- MUST mark completed tasks immediately.
- MUST append file-level changes to the changes log after each completed task.
- MUST document any divergence from the original plan with a reason.

## Validation

- MUST validate each completed task before moving on.
- MUST keep plan state, changes log, and code reality synchronized.
