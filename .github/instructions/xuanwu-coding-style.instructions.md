---
name: Xuanwu Coding Style
description: General coding conventions and naming rules
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx"
---

# Coding Style Guidelines

## Naming

Use consistent naming conventions:

- PascalCase → classes, React components, types
- camelCase → variables and functions
- UPPER_SNAKE_CASE → constants
- kebab-case → file names when appropriate

## Functions

Prefer small and focused functions.

Rules:

- Each function should do one thing.
- Avoid deeply nested logic.
- Extract reusable logic into utilities.

## Error handling

- Always handle async errors.
- Provide meaningful error messages.
- Avoid silent failures.

## Readability

- Prefer clarity over clever code.
- Use descriptive variable names.
- Avoid unnecessary abstractions.

## Comments

Write comments only when the intention is not obvious.

Focus on explaining **why**, not **what**.