---
name: breakdown-epic-arch
description: 'Generate high-level technical architecture for an Epic from a PRD input. Use when designing system components, service boundaries, data flows, and integration points for a new epic. Triggers: "architecture for epic", "technical design", "epic arch", "system design from PRD", "breakdown architecture".'
---

# Breakdown Epic Arch

## When to Use
- A Product Requirements Document (PRD) exists and needs translation into a technical design
- Defining component responsibilities and service boundaries for a new epic
- Mapping data flows, APIs, and integration points before development starts

## Prerequisites
- Read the Epic PRD created by the `breakdown-epic-pm` skill
- Review `docs/architecture/00-logic-overview.md` for existing architectural constraints
- Identify which existing slices or modules will be affected

## Workflow
1. Parse the PRD: extract goals, user stories, and functional requirements.
2. Identify system components: new services, updated modules, external integrations.
3. Define service/module boundaries: what each component owns and what it does NOT own.
4. Design data models: entities, relationships, and storage strategy.
5. Map data flows: sequence diagrams or flow descriptions for main use cases.
6. List API contracts: endpoints, input/output schemas, error codes.
7. Identify non-functional requirements: performance, security, availability implications.
8. Flag architecture decisions that need ADR (Architecture Decision Record) documentation.

## Output Contract
- Produce an architecture doc with: Components, Boundaries, Data Models, Data Flows, API Contracts, NFRs, Open Questions.
- Each component boundary must explicitly state its responsibilities and dependencies.
- Flag ADR-worthy decisions separately for human review.

## Guardrails
- Respect existing architectural boundaries defined in `docs/architecture/`.
- Do not introduce new cross-boundary dependencies without an explicit justification.
- Align all entity names with `.memory/knowledge-graph.json`.

## Source of Truth
- Architecture SSOT: `docs/architecture/00-logic-overview.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
