---
name: xuanwu-serena
description: Serena-first optimization workflow for Xuanwu customizations.
argument-hint: "Goal, scope, constraints, acceptance criteria"
agent: xuanwu-serena-autonomous
model: GPT-5.3-Codex
tools:
  - io.github.upstash/context7/*
  - sequentialthinking/*
  - software-planning/*
  - oraios/serena/*
---

# Xuanwu Serena Prompt

Run this workflow in order and do not skip steps.

## Required Sequence

1. Orientation gate:
   - Read `skills/SKILL.md` for rapid repository orientation.
   - Verify MCP server keys in `.vscode/mcp.json` include:
     - `io.github.upstash/context7`
     - `sequentialthinking`
     - `oraios/serena`
2. Context7 first:
   - Resolve and query `oraios/serena` docs.
   - Capture implementation-relevant guidance and source URLs.
3. Sequentialthinking second:
   - Build a compact plan with risk trade-offs.
   - Choose a minimal-risk implementation path.
4. Serena initialization third:
   - Execute `oraios/serena` `initial_instructions`.
   - Execute onboarding or memory checks needed for current task.
5. Implement:
   - Apply focused edits only.
   - Respect Xuanwu architecture and i18n constraints.
   - Ensure guidance coverage is explicit for React, Next.js (including parallel routes), Firebase (Firestore and Storage), and development/testing workflows across `.github/agents`, `.github/instructions`, `.github/prompts`, and `.github/skills` when relevant.
6. Validate:
   - Check changed files for errors.
   - Include follow-up validation commands if needed.

## Output Contract

Use this exact section order:

1. `Task Restatement`
2. `Scope`
3. `Context7 Findings`
4. `Sequential Plan`
5. `Implemented Changes`
6. `Validation`
7. `Residual Risks`

## Self-Test Checklist

- Confirm `.vscode/mcp.json` has `io.github.upstash/context7`, `sequentialthinking`, and `oraios/serena`.
- Confirm `initial_instructions` and `check_onboarding_performed` are callable.
- Confirm guidance coverage remains explicit for React, Next.js (including parallel routes), Firebase (Firestore and Storage), and development/testing workflows across `.github/agents`, `.github/instructions`, `.github/prompts`, and `.github/skills` when relevant.
- If any required tool is unavailable, report failed call and continue with a conservative fallback.

## References

- Workspace instructions: [copilot-instructions](../copilot-instructions.md)
- Serena autonomy rules: [xuanwu-serena-autonomy.instructions.md](../instructions/xuanwu-serena-autonomy.instructions.md)
- Bootstrap skill: [xuanwu-serena-bootstrap](../skills/xuanwu-serena-bootstrap/SKILL.md)
- VS Code custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- VS Code prompt files: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- VS Code custom agents: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- VS Code agent skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
