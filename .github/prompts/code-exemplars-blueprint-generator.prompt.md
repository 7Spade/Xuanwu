---
name: code-exemplars-blueprint-generator
description: 'Generate a reusable prompt for scanning a codebase and extracting high-quality code exemplars.'
agent: 'agent'
tools: ['search/codebase', 'repomix', 'edit/editFiles']
---

# Code Exemplars Blueprint Generator

Generate a prompt that scans the current repository for representative, high-quality examples.

## Required behavior
1. Detect stack/language from repository files.
2. Identify exemplar files by readability, correctness, and architecture compliance.
3. Group exemplars by category (pattern, layer, or file type).
4. Include path references and short rationale for each exemplar.

## Output
Return a complete `.prompt.md` body that can be reused directly.
