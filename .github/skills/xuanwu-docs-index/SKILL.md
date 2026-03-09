---
name: xuanwu-docs-index
description: Index and navigate Xuanwu architecture and management docs. Use this skill when you need architecture SSOT lookup, governance rule tracing, open-vs-archived management item routing, or documentation triage keywords like architecture, management, issue, debt, security audit, semantic conflict, and performance bottleneck.
---

# Xuanwu Docs Index

## Overview

Use this skill when you need to:
- Find architecture SSOT and related rule documents under `docs/architecture/`
- Locate management registers under `docs/management/`
- Decide whether an item belongs in active register files or archive files
- Trace governance context before implementing or reviewing changes

## Files

| File | Purpose |
|------|---------|
| `references/architecture-index.md` | Architecture document map and lookup workflow |
| `references/management-index.md` | Management register map, active/archive routing rules, and migration checklist |

## How To Use

### 1. Architecture lookup (`docs/architecture`)

1. Read `docs/architecture/00-logic-overview.md` as primary SSOT.
2. Use `docs/architecture/00-index.md` for navigation.
3. For flow/path questions, read `docs/architecture/01-logical-flow.md`.
4. For rule constraints, read `docs/architecture/02-governance-rules.md`.
5. For infra/projection mapping, read `docs/architecture/03-infra-mapping.md`.
6. For review gates, read `docs/architecture/99-checklist.md`.

### 2. Management lookup (`docs/management`)

Active (open/in progress) items MUST stay in:
- `docs/management/technical-debt.md`
- `docs/management/semantic-conflicts.md`
- `docs/management/security-audits.md`
- `docs/management/issues.md`
- `docs/management/performance-bottlenecks.md`

Resolved/closed items MUST be migrated to:
- `docs/management/technical-debt-archive.md`
- `docs/management/semantic-conflicts-archive.md`
- `docs/management/security-audits-archive.md`
- `docs/management/issues-archive.md`
- `docs/management/performance-bottlenecks-archive.md`

### 3. Migration workflow (active -> archive)

1. Confirm close reason/status in active file.
2. Copy the full original entry to the matching archive file (preserve structure).
3. Add closure metadata required by that archive file template.
4. Remove the entry from the active file.
5. Update summary tables/counts/last-updated line in both files if present.
6. Keep cross-references (Issue/SA/TD/SC/PB) intact after migration.

## Output Contract

- Always cite exact file paths used for conclusions.
- Always classify item location as `active` or `archive`.
- Never mix active and archived records in the same register file.

## Guardrails

- Treat `docs/architecture/00-logic-overview.md` as architecture SSOT.
- Do not invent statuses not defined by target archive process.
- Preserve existing entry format when moving records.

## Source of Truth

- `docs/architecture/00-logic-overview.md`
- `docs/architecture/00-index.md`
- `references/architecture-index.md`
- `references/management-index.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
