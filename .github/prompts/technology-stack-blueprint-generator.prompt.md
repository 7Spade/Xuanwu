---
name: technology-stack-blueprint-generator
description: 'Generate a prompt that produces a practical technology stack blueprint from repository evidence.'
agent: 'agent'
tools: ['search/codebase', 'repomix/*', 'edit/editFiles']
---

# Technology Stack Blueprint Generator

Generate a meta-prompt that documents the stack from actual code/config evidence.

## Required sections in generated blueprint
- Detected languages/frameworks/platforms
- Key dependencies and tooling
- Architecture/layer mapping
- Coding conventions observed
- Optional version and license details

## Output
Return a complete `.prompt.md` suitable for direct use, with clear inputs and output format.
