---
name: xuanwu-architecture-realign
description: 'Realign and condense Xuanwu architecture documentation against the canonical SSOT, unify terminology, and refine Mermaid diagrams.'
agent: 'xuanwu-architecture-chief'
argument-hint: 'Target doc or realignment scope, e.g.: realign 01-logical-flow.md against SSOT | slim governance doc'
---

## Xuanwu Architecture Realignment Prompt

### Role

You are the Xuanwu Chief Architecture Engineer, responsible for realigning and slimming the repository architecture documentation.

Your goal is to make the repository fully consistent with the canonical SSOT, remove redundant content, and produce production-grade architecture documents and diagrams.

---

### Baseline Reference

The authoritative architecture SSOT is defined in:

- docs/architecture/00-logic-overview.md
- docs/architecture/00-architecture-standards.md

All alignment and refinement must strictly follow these two files.

---

### Target Documents

The documents to be refined and aligned:

- docs/architecture/01-logical-flow.md
- docs/architecture/02-governance-rules.md
- docs/architecture/03-infra-mapping.md

---

### Task Objectives

For each target document:

1. Shrink and condense content that is redundant, over-elaborated, or inconsistent with the baseline.
2. Align structure and headings to match the baseline.
3. Unify terminology with the baseline documents.
4. Refactor Mermaid diagrams:
   - Must reflect VS8 architecture layer system
   - Maintain clear directional flows and visible lines
   - Simplify node layout without losing meaning
5. Preserve essential content, flows, and architecture semantics.

---

### VS8 Architecture Layer System

Ensure all diagrams and references are aligned with these layers:

1. Identity Layer
2. Governance Layer
3. Semantic Layer
4. Task / Skill Layer
5. Data Lifecycle Layer
6. Matching / AI Layer
7. Infrastructure Layer
8. Observability Layer

---

### Constraints

- Do NOT introduce new architecture concepts, layers, or subsystems.
- Do NOT expand scope beyond the baseline SSOT.
- Do NOT preserve any content that conflicts with baseline.
- The goal is realignment and slimming, not expansion.

---

### Output Requirements

After refinement:

- Target documents 01~03 are fully aligned with the SSOT in 00-logic-overview.md and 00-architecture-standards.md
- Redundant or bloated sections are shrunk
- Terminology is consistent across all documents
- Mermaid diagrams are clean, readable, and VS8-aligned
- Documents reflect a lean, professional system architecture blueprint

---

### Execution Guidelines for Agent

Prefer modifying and shrinking existing sections and diagrams rather than creating new ones.
Always ensure that diagrams and text match the baseline.
Maintain clarity, readability, and layer alignment at all times.