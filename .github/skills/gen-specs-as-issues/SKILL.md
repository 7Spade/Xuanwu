---
name: gen-specs-as-issues
description: 'Identify missing features or gaps in a codebase, prioritize them, and generate detailed GitHub issue specifications. Use when building a backlog from requirements, discovering feature gaps, or converting a requirements doc into trackable issues. Triggers: "gen specs", "create issues", "feature gaps", "spec to issues", "backlog generation".'
---

# Gen Specs As Issues

## When to Use
- Converting a requirements document or PRD into GitHub issues
- Auditing a codebase for missing functionality against a specification
- Building an initial backlog for a new project or feature area

## Prerequisites
- Have a requirements source: PRD, specification doc, or user story map
- Access to the target GitHub repository or issue tracker
- Identify the priority framework to use: MoSCoW, RICE, or simple High/Med/Low

## Workflow
1. Parse the requirements source: extract every stated feature and capability.
2. Compare against existing code and issues to identify what is missing or incomplete.
3. Prioritize gaps by business impact and implementation effort.
4. For each prioritized gap, write a detailed issue spec:
   - Title: clear, action-oriented
   - Description: what it does and why it matters
   - Acceptance criteria: testable conditions
   - Labels: feature area, priority, effort estimate
5. Group related issues under a parent epic or milestone.
6. Review the issue list with the user before creating issues in GitHub.

## Output Contract
- Produce a list of issue specs in Markdown or directly create GitHub issues.
- Each issue must have: Title, Description, Acceptance Criteria, Labels, Parent Epic.
- Include a coverage summary: total gaps found, prioritized, deferred.

## Guardrails
- Do not create duplicate issues — check existing issues before generating.
- Do not set priority without business context — ask if unclear.
- Flag issues that require architecture decisions before they can be estimated.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
