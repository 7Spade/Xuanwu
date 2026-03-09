---
name: compliance-audit
description: 'Project-wide compliance audit against architecture, naming, structure, and data rules.'
agent: 'agent'
tools: ['search/codebase', 'read', 'sequentialthinking/*']
---

# Compliance Audit

Run a compliance audit against project governance documents.

## Required references
- [docs/architecture/00-logic-overview.md](../../docs/architecture/00-logic-overview.md)
- [docs/domain-glossary.md](../../docs/domain-glossary.md)
- [docs/project-structure.md](../../docs/project-structure.md)

## Output
- Passed checks
- Violations with evidence (`path:line`)
- Suggested minimal remediations
