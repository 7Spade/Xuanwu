---
name: xuanwu-ui
description: 'Design, audit, or refine Xuanwu UI with shadcn/ui consistency, i18n-safe text changes, responsive behavior, and metadata-aware frontend polish.'
agent: 'xuanwu-ui'
argument-hint: 'Describe the UI task, e.g.: audit dashboard consistency | add Japanese locale to the navbar'
---

# Xuanwu UI Workflow

This prompt consolidates the UI-focused prompt set into one Xuanwu-specific command.

## Modes

1. **UI design / audit** — design system consistency, accessibility, and responsive behavior.
2. **shadcn/ui composition** — component reuse, theme-token discipline, and accessibility-safe composition.
3. **Localization** — add or adjust languages and keep UI text synchronized.
4. **Metadata-aware UI polish** — keep page-level metadata and user-facing presentation aligned.

## Guardrails

- Do not hardcode user-facing UI text.
- Keep locale keys synchronized across language files.
- Use the project design vocabulary instead of one-off styling approaches.

Task: ${input:task:Describe the UI task}
