---
name: xuanwu-serena-bootstrap
description: Bootstrap and optimize /xuanwu-serena workflow: context7 lookup, sequentialthinking plan, Serena initialization, and configuration hardening.
argument-hint: "Describe target workflow and expected deliverables"
---

# Skill Instructions

Use this skill when users request `/xuanwu-serena` setup, repair, or optimization.

## Workflow

1. Read `skills/SKILL.md` first for rapid project orientation (scope, architecture cues, key modules).\n2. Resolve and query Serena docs through Context7:\n   - Resolve library id for `oraios/serena`.\n   - Fetch docs for MCP configuration and initialization guidance.
2. Run sequentialthinking to produce an explicit change plan:
   - Current-state findings.
   - Candidate solutions.
   - Chosen solution with risk rationale.
3. Execute Serena initialization chain:
   - `initial_instructions` first.
   - onboarding and/or relevant memory checks.
4. Apply configuration updates with minimal diffs.
5. Validate and report:
   - run `get_errors` on modified files.
   - include file references and residual risks.

## Safety and Quality

- Do not embed secrets or API keys.
- Keep UTF-8 (no BOM).
- Prefer additive and backward-compatible changes.
- If context7 evidence is unavailable, mark conservative assumptions and add validation steps.

## Validation Checklist

- Run Serena init chain before structural edits:
  - `initial_instructions`
  - onboarding or memory verification
- Validate modified markdown config files with `get_errors`.
- Validate MCP server readiness from `.vscode/mcp.json` (`oraios/serena`, `io.github.upstash/context7`, `sequentialthinking`).
- Use VS Code Chat Diagnostics to verify assets are loaded.

## References

- [VS Code Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [VS Code Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [VS Code Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
