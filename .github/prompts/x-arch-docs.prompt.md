---
name: x-arch-docs
description: 'Architecture documentation management — four modes: (A) write ADRs in MADR format, (B) sync docs/architecture with code reality, (C) prune stale knowledge graph entries, (D) govern project memory. Keeps all authoritative documents consistent with implementation.'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'software-planning/*', 'memory/*', 'edit/editFiles']
argument-hint: 'Describe what to document or sync, e.g.: capture CQRS gateway decision | sync workspace.slice | prune graph'
---

# Architecture Docs — ADR · Doc Sync · Graph Pruner · Memory Governance

## Source of Truth

- [docs/architecture/00-logic-overview.md](../../docs/architecture/00-logic-overview.md) — supreme authority
- [docs/domain-glossary.md](../../docs/domain-glossary.md)
- [docs/persistence-model-overview.md](../../docs/persistence-model-overview.md)
- [docs/project-structure.md](../../docs/project-structure.md)

---

## Mode A — ADR Authoring

Formally capture significant architectural decisions in MADR format.

### ADR Lifecycle

| Phase | Tool | Action |
|-------|------|--------|
| Context Collection | #tool:repomix | Scan existing ADRs in `docs/adr/`; identify gaps |
| Option Analysis | #tool:sequential-thinking | Enumerate alternatives; list pros/cons |
| Document Generation | #tool:software-planning | Produce MADR-format draft |

### Standard MADR Format

```markdown
# ADR-XXXX: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context and Problem Statement
[Describe the problem being solved]

## Decision Drivers
- [Force/constraint 1]

## Considered Options
- Option A
- Option B

## Decision Outcome

### Chosen Option: "Option A"
[Reason]

### Consequences
- Good: [...]
- Bad: [...]
```

**Scope boundary:** ADRs cover architectural decisions only; implementation details stay in code comments. One decision per ADR.

---

## Mode B — Documentation Sync

Ensure `docs/architecture/00-logic-overview.md` and related documents always reflect the actual code state.

### Sync Workflow

1. **Code Reality Scan:** Use #tool:repomix to extract current BC boundaries, Event contracts, and Projection structures.
2. **Document Comparison:** Use #tool:sequential-thinking to compare with `docs/architecture/00-logic-overview.md` and identify discrepancies.
3. **Update Planning:** Use #tool:software-planning to produce an update roadmap specifying which paragraphs require revision.
4. **Document Revision:** Update the documentation; ensure narrative remains coherent.

**Scope boundary:** This mode **only updates documents**; it never modifies code. If code is found incorrect, open an issue.

---

## Mode C — Knowledge Graph Pruning

Remove outdated, contradictory, or duplicated entries from the memory knowledge graph.

### Pruning Workflow

1. **Full Graph Read:** Use #tool:memory (`read_graph`) to load the current knowledge graph.
2. **Contradiction Detection:** Use #tool:sequential-thinking to check:
   - Multiple entities representing the same concept?
   - Relations referencing deleted or renamed entities?
   - Entries contradicting the current `docs/architecture/00-logic-overview.md`?
3. **Execute Pruning:** Use #tool:memory (`delete_entities` or `delete_relations`) to clean invalid data.
4. **Re-Sync:** Read the latest architecture document and use #tool:memory (`create_entities`) to add missing knowledge.

### Pruning Standards

- **Conflict resolution:** The version recorded after the last deployment date prevails.
- **Deduplication:** Keep the most specific description; remove over-generalized summaries.
- **Freshness:** Any entity not verified for more than 30 days must be re-confirmed.

---

## Mode D — Memory Governance

Keep reusable project facts accurate across sessions.

### Rules

1. Read relevant memory before major implementation or audit work.
2. Store stable, reusable facts after meaningful decisions.
3. Prefer architecture invariants, conventions, and verified commands.
4. Do not store secrets or volatile runtime details.

### What to store

- Architecture decisions and invariants
- Verified build/lint/test commands
- Naming conventions and domain vocabulary
- Established patterns and anti-patterns

---

## Output

- **ADR mode:** Complete MADR document ready to commit to `docs/adr/`
- **Sync mode:** List of updated sections + rationale for each change
- **Pruning mode:** Deleted entities/relations + newly added knowledge
- **Governance mode:** What was read, what was added/updated, why each item is useful

Task: ${input:task:Describe what to document, sync, prune, or govern}
