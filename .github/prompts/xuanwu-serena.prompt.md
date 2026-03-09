---
name: xuanwu-serena
description: "Xuanwu Serena bootstrap and optimization workflow (context7 -> sequentialthinking -> serena -> implement -> validate)"
argument-hint: "Task, scope, constraints, acceptance criteria"
agent: xuanwu-serena-autonomous
model: GPT-5.3-Codex\ntools:\n  - io.github.upstash/context7/*\n  - sequentialthinking/*\n  - oraios/serena/*
---

# Xuanwu Serena Prompt

Run this workflow in order and do not skip steps.

## Required Sequence

1. Context7 first:
   - Resolve and query `oraios/serena` docs.
   - Capture implementation-relevant guidance and source URLs.
2. Sequentialthinking second:
   - Build a compact plan with risk trade-offs.
   - Choose a minimal-risk implementation path.
3. Serena initialization third:
   - Execute `oraios/serena` `initial_instructions`.
   - Execute onboarding or memory checks needed for current task.
4. Implement:
   - Apply focused edits only.
   - Respect Xuanwu architecture and i18n constraints.
5. Validate:
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

## References

- Workspace instructions: [copilot-instructions](../copilot-instructions.md)
- Serena autonomy rules: [xuanwu-serena-autonomy.instructions.md](../instructions/xuanwu-serena-autonomy.instructions.md)
- Bootstrap skill: [xuanwu-serena-bootstrap](../skills/xuanwu-serena-bootstrap/SKILL.md)
