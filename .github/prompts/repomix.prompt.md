---
name: tool-repomix
description: 'Use repomix to package repository context before architecture analysis, cross-file refactoring, or deep diagnostics.'
tools: ['repomix/*']
agent: 'agent'
---

# Repository Context Loading

When task scope is large or cross-cutting, pack context first.

## When to use
- Architecture design/review
- Multi-file refactors
- Docs-vs-code consistency checks
- Complex root-cause analysis

## Output
- Packed scope used
- Key structure/dependency findings
- Assumptions and limits
