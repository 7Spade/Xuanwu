---
name: xuanwu-webapp
description: Prompt template for React/Next.js + Firebase + testing tasks following Serena-first workflow.
agent: xuanwu-webagent
model: GPT-5.3-Codex
tools:
  - io.github.upstash/context7/*
  - sequentialthinking/*
  - software-planning/*
  - oraios/serena/*
---

# Xuanwu Webapp Prompt

Required sequence (Serena-first):

1. Orientation: read `skills/SKILL.md` and identify relevant files.
2. Context7: resolve `/oraios/serena` and fetch MCP setup & onboarding guidance.
3. Plan: run `sequentialthinking` and, if helpful, `software-planning` for multi-step tasks.
4. Initialize: call `oraios/serena` `initial_instructions` and `check_onboarding_performed`.
5. Implement: apply focused edits; for UI changes add i18n keys and tests.
6. Test: add/execute Playwright E2E and unit tests; report failing suites.
7. Validate: run `npm run check` (or `get_errors` if available) and report residual risks.

Output: Task Restatement, Scope, Context7 Findings, Plan, Implemented Changes, Validation, Residual Risks.
