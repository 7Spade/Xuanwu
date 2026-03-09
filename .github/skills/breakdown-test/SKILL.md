---
name: breakdown-test
description: 'Generate comprehensive test strategies, task breakdowns, and quality validation plans for a feature or epic. Use when planning QA coverage for a release, writing a test plan, or defining acceptance test criteria. Triggers: "breakdown test", "test plan", "QA plan", "test strategy", "test coverage", "acceptance testing".'
---

# Breakdown Test

## When to Use
- Planning test coverage before implementing a new feature
- Auditing an existing feature for missing tests
- Creating a QA checklist for a release candidate

## Prerequisites
- Obtain the feature spec or user stories (use `breakdown-epic-pm` or `create-specification` first)
- Identify the test frameworks in use: unit (Jest/Vitest), integration, e2e (Playwright/Cypress)

## Workflow
1. Parse stories and acceptance criteria to identify testable behaviors.
2. Map each behavior to a test type: unit / integration / e2e / manual.
3. Write test case descriptions: "Given [state], When [action], Then [expected result]".
4. Identify edge cases: boundary values, error states, empty/null inputs, race conditions.
5. Define test data requirements: fixtures, mocks, seed data needed.
6. Estimate effort per test type and flag high-risk areas for priority coverage.
7. Define the coverage target: what percentage and which paths must be covered.
8. Produce a test task list that can be directly added to a sprint plan.

## Output Contract
- Produce a test plan with: Coverage Scope, Test Cases by Type, Edge Cases, Test Data, Coverage Target, Task List.
- Each test case must follow Given/When/Then format.
- Flag untestable requirements and escalate for clarification.

## Guardrails
- Do not skip edge cases for "happy path only" — document them explicitly as out-of-scope if excluded.
- Align test scope with acceptance criteria; do not test implementation details.
- Do not mark test planning complete until all acceptance criteria have at least one corresponding test case.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
