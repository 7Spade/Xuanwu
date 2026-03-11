---
name: code-exemplars-blueprint-generator
description: 'Generate customizable AI prompts for scanning codebases and identifying high-quality code exemplars to establish coding standards. Use when auditing a codebase for best-practice examples or creating reference standards for a team. Supports .NET, Java, JavaScript, TypeScript, React, Angular, and Python. Triggers: "code exemplars", "code standards", "best practice scan", "exemplar generator", "coding standards".'
---

# Code Exemplars Blueprint Generator

## When to Use
- Establishing coding standards for a new team or project
- Identifying the best-quality code in a legacy codebase as reference
- Generating a prompt that can scan multiple codebases for exemplar patterns

## Prerequisites
- Identify the target language(s) and framework(s)
- Define quality dimensions to evaluate: readability, testability, error handling, documentation
- Clarify the output format: Markdown catalog, annotated file list, or structured report

## Workflow
1. Confirm the target language, framework, and quality dimensions with the user.
2. Generate a scanning prompt tailored to the specified stack.
3. Define exemplar categories: naming conventions, error handling, test structure, data models, etc.
4. Produce a blueprint prompt that instructs the AI to score and rank code samples.
5. Include a documentation template for each identified exemplar.
6. Optionally generate a negative-exemplar catalog (anti-patterns to avoid).

## Output Contract
- Produce a customizable prompt file targeting the specified language and framework.
- The generated prompt must include: scan scope, quality criteria, output format, exemplar template.
- Flag ambiguous quality criteria for human review before use.

## Guardrails
- Do not score or rank code without defined, objective criteria.
- Do not include real code samples from proprietary sources in the output.
- Keep generated prompts under 2000 tokens to remain within context budgets.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
