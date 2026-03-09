---
name: tool-shadcn
description: 'shadcn/ui implementation guard for component reuse, theme token consistency, and accessibility.'
tools: ['shadcn']
agent: 'agent'
---

# shadcn/ui Component Implementation Guide

Ensure UI work follows project shadcn conventions.

## Rules
- Reuse existing shadcn components first
- Use theme tokens (no hardcoded brand colors)
- Keep interactive elements accessible (`aria-*`, role, keyboard)
- Use project import paths from `@/shadcn-ui/*`

## Output
- Component choice rationale
- Any customization notes
- Accessibility and style compliance checks
