---
description: "Rules for implementing tracked task plans and maintaining change records."
applyTo: "**/.copilot-tracking/**/*.md"
---

# Task Plan Implementation Rules

Apply these rules when executing plans from `.copilot-tracking/plans/**` and `.copilot-tracking/details/**`.

## Preparation Rules

- MUST read the full plan file before coding.
- MUST read the full matching changes file before coding.
- MUST identify and review all files referenced by the current task.

## Execution Rules

1. MUST execute tasks in plan order.
2. MUST read the full detail section for each task before implementation.
3. MUST implement complete working behavior, not partial scaffolding.
4. MUST follow workspace patterns for naming, layering, error handling, and tests.

## Tracking Rules

- MUST mark each completed task `[x]` in the plan immediately after completion.
- MUST append file-level entries to `Added`, `Modified`, or `Removed` in the changes file after every completed task.
- MUST record any divergence from plan/details with explicit reason.
- MUST mark a phase complete only when every task in that phase is complete.

## Validation Rules

- MUST validate each task outcome before moving to the next task.
- MUST fix discovered issues before proceeding.
- MUST keep implementation state and tracking documents synchronized.

## Completion Rules

- MUST consider implementation complete only when all tasks/phases are complete and success criteria are met.
- MUST add a final `Release Summary` only after all phases are complete.

## Changes File Format Rules

- MUST include `<!-- markdownlint-disable-file -->` at the top of changes files.
- MUST use relative file paths and one-sentence summaries per entry.