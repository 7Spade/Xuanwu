---
name: quasi-coder
description: 'Expert 10x engineer skill for interpreting and implementing code from shorthand, quasi-code, and natural language descriptions. Use when collaborators provide incomplete code snippets, pseudo-code, or descriptions with potential typos or incorrect terminology. Excels at translating non-technical or semi-technical descriptions into production-quality code. Triggers: "quasi-coder", "implement this", "code from description", "pseudo-code", "shorthand code".'
---

# Quasi-Coder

## When to Use
- A collaborator provides pseudo-code, shorthand, or natural language and expects working code
- An incomplete snippet has typos, incorrect API names, or mixed-language syntax
- Translating a non-technical description of logic into production-quality TypeScript/JavaScript

## Prerequisites
- Read the relevant files to understand the project's naming conventions, error handling style, and module structure
- Identify the target language and framework from context or explicit statement

## Workflow
1. Read the quasi-code or description carefully; identify the core intent.
2. Note every ambiguity, potential typo, or incorrect term and make a best-guess interpretation.
3. Map pseudo-code constructs to actual APIs in the target language/framework.
4. Write production-quality code that fulfills the intent: typed, error-handled, idiomatic.
5. List every assumption made during translation.
6. Flag any part of the input that could not be translated reliably and ask for clarification.
7. Verify the output compiles or type-checks if a local check is available.

## Output Contract
- Produce working, production-quality code with all types, imports, and error handling included.
- Include an "Assumptions" section listing every interpretation made.
- Flag untranslatable parts explicitly; do not silently omit them.

## Guardrails
- Do not invent business logic not implied by the quasi-code — ask if intent is unclear.
- Do not skip error handling even if the quasi-code omits it.
- Do not expose credentials or secrets that may appear in example quasi-code.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
