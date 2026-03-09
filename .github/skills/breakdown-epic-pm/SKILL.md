---
name: breakdown-epic-pm
description: 'Create an Epic Product Requirements Document (PRD) that captures business goals, user stories, and acceptance criteria as input for technical architecture design. Use when defining a new epic, planning a major feature, or documenting product requirements. Triggers: "create PRD", "epic PRD", "product requirements", "write epic spec", "breakdown epic pm".'
---

# Breakdown Epic Pm

## When to Use
- Defining a new epic that will be handed off to architecture design
- Documenting business goals and user stories before technical work begins
- Creating a requirements baseline for sprint planning or stakeholder review

## Prerequisites
- Understand the business goal and user problem being solved
- Identify the primary user personas or stakeholders
- Review any existing related epics or feature flags

## Workflow
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

## Guardrails
- Do not include implementation details or technical decisions in the PRD.
- Do not mark the PRD complete until all acceptance criteria are testable.
- Align terminology with business domain — avoid technical jargon in user stories.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
