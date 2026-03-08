---
description: "Rules for writing self-explanatory code with minimal, intent-focused comments."
applyTo: "**/*"
---

# Self-explanatory Code Commenting Rules

## Core Principle

- MUST write self-explanatory code first.
- MUST add comments only when they explain intent, constraints, or trade-offs.
- MUST avoid comments that only restate obvious code behavior.

## When to Comment

- SHOULD comment complex business rules and non-obvious algorithm choices.
- SHOULD comment external constraints (API limits, protocol quirks, compatibility issues).
- SHOULD document regex intent, assumptions, and edge-case handling.
- SHOULD add concise docs for public APIs when signatures alone are insufficient.

## When Not to Comment

- MUST NOT keep commented-out dead code.
- MUST NOT use changelog/history comments in source files.
- MUST NOT add decorative separator comments with no semantic value.
- MUST remove or update stale comments during refactors.

## Preferred Annotation Tags

- MAY use `TODO`, `FIXME`, `HACK`, `NOTE`, `WARNING`, `PERF`, `SECURITY`, `BUG`, `REFACTOR`, and `DEPRECATED` when specific and actionable.

## Quality Gate

- MUST ensure each comment remains accurate after edits.
- MUST place comments near the code they clarify.
- MUST keep comments short, precise, and professional.

The best comment is one that prevents misunderstanding that good naming and structure cannot prevent alone.
