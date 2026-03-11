---
name: breakdown-epic-pm
description: 'Canonical requirements authoring skill for epic PRDs and pre-implementation specifications. Use when defining a new epic, planning a major feature, or documenting product/technical requirements. Triggers: "create PRD", "epic PRD", "product requirements", "write epic spec", "breakdown epic pm", "create spec", "technical spec".'
---

# Breakdown Epic Pm

## Consolidation Status
- Canonical requirements authoring skill for PRD and technical-spec mode.
- Backward-compatible alias: `../create-specification/SKILL.md`.

## When to Use
- Defining a new epic that will be handed off to architecture design
- Documenting business goals and user stories before technical work begins
- Creating a requirements baseline for sprint planning or stakeholder review
- Writing a technical specification before implementation starts

## Prerequisites
- Understand the business goal and user problem being solved
- Identify the primary user personas or stakeholders
- Review any existing related epics or feature flags

## Workflow
Mode selection:
- `PRD mode`: persona/story-centric product requirements.
- `Tech-spec mode`: contract/data-model/rule-centric technical specification.

1. State the epic title, business goal, and success metric in one paragraph.
2. Identify primary user personas: who will use this feature and why.
3. Write user stories in "As a [role], I want [goal], so that [benefit]" format.
4. Define acceptance criteria for each story: testable, observable conditions.
5. List out-of-scope items explicitly to prevent scope creep.
6. Document non-functional requirements: performance, security, accessibility, localization.
7. List open questions and dependencies that block design or implementation.
8. Confirm the PRD with stakeholders before handing off to architecture.

## Output Contract
- Produce a Markdown PRD with: Epic Title, Goal, Personas, User Stories, Acceptance Criteria, Out of Scope, NFRs, Open Questions.
- Each acceptance criterion must be testable — no ambiguous "should feel good" statements.
- Include a "Ready for Architecture" checkbox at the end.
- In `Tech-spec mode`, include: Scope, Purpose, Contract, Data Model, Rules, Acceptance Criteria, NFRs.

## Guardrails
- Do not include implementation details or technical decisions in the PRD.
- Do not mark the PRD complete until all acceptance criteria are testable.
- Align terminology with business domain — avoid technical jargon in user stories.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
