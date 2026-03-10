---
name: "Xuanwu TypeScript and Context7 Rules"
description: "Project-specific TypeScript/ES2022 rules plus Context7 usage guidance for version-sensitive JavaScript and TypeScript work."
applyTo: "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---

# Xuanwu TypeScript and Context7 Rules

## TypeScript / ES2022

- MUST target TypeScript 5.x and ES2022 semantics unless project configuration clearly requires otherwise.
- MUST prefer explicit, safe types over `any`; use `unknown` plus narrowing at boundaries.
- MUST use semantic naming and stable public contracts.
- MUST add or update tests for behavior changes where existing test infrastructure covers the area.

## Input and Error Handling

- MUST validate unknown input with type guards or schema validation.
- MUST use structured async error propagation and clear failure handling.

## Context7 Usage

- MUST use Context7 for version-sensitive framework APIs, config keys, and security-critical library integrations.
- MUST fetch minimal authoritative documentation before implementing version-sensitive behavior.
- MUST continue with conservative, clearly labeled assumptions only when reliable docs are unavailable.
