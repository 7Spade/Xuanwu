---
name: create-specification
description: 'Create a structured specification document optimized for AI consumption and developer reference. Use when documenting a new feature, system boundary, API contract, or data model before implementation begins. Triggers: "create spec", "write specification", "document feature", "technical spec", "api contract", "feature spec".'
---

# Create Specification

## When to Use
- Defining requirements for a new feature before writing any code
- Documenting a public API, service boundary, or data schema
- Creating a reference doc that AI agents will use during implementation

## Prerequisites
- Identify the feature or system being specified
- Review related architecture docs in `docs/architecture/`
- Gather any existing designs, wireframes, or business requirements

## Workflow
1. Define the scope: what the specification covers and what it explicitly excludes.
2. State the purpose and business goal in one paragraph.
3. Document the API or interface contract: inputs, outputs, error conditions.
4. Specify data models: field names, types, constraints, and default values.
5. List behavioral rules as imperative statements (MUST / SHOULD / MAY).
6. Add acceptance criteria: testable conditions that confirm the spec is met.
7. List non-functional requirements: performance, security, availability.
8. Save the file to `docs/` or the appropriate domain directory.

## Output Contract
- Produce a single Markdown file with: Scope, Purpose, Contract, Data Model, Rules, Acceptance Criteria, NFRs.
- All rules must be imperative and testable — no ambiguous "should consider" statements.
- Include a version or date stamp.

## Guardrails
- Do not specify implementation details (how to code it) — only behavior (what it does).
- Do not include credentials, tokens, or example values that resemble real secrets.
- Align terminology with `docs/architecture/00-logic-overview.md`.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Architecture SSOT: `docs/architecture/00-logic-overview.md`
