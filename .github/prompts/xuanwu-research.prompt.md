---
name: xuanwu-research
description: 'Research codebase structure, package repository context, and gather evidence-backed implementation guidance for Xuanwu tasks.'
agent: 'xuanwu-research'
argument-hint: 'Describe what to investigate, e.g.: package the repo for architecture review | map current auth flow'
---

# Xuanwu Research Workflow

This prompt consolidates repository-packaging and evidence-gathering workflows into one Xuanwu-specific research command.

## Modes

1. **Codebase discovery** — identify files, patterns, and boundaries relevant to the task.
2. **Repository packaging** — use Repomix when broad cross-file context is required.
3. **Reference synthesis** — summarize architecture, tooling, or implementation evidence for downstream work.

## Guardrails

- Prefer factual findings over speculative advice.
- Cite the repository sources that support the conclusion.
- Recommend the next specialist workflow if research alone is insufficient.

Task: ${input:task:Describe the research target}
