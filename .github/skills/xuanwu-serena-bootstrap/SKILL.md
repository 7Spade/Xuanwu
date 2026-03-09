---
name: xuanwu-serena-bootstrap
description: Bootstrap and optimize /xuanwu-serena workflow with context7, planning, serena initialization, and validation.
argument-hint: "Target workflow and expected deliverables"
---

# Skill Instructions

Use this skill when users request `/xuanwu-serena` setup, repair, or optimization.

## Workflow

1. Read `skills/SKILL.md` for rapid repository orientation.
2. Resolve and query Serena docs through Context7:
   - Resolve library ID for `oraios/serena`.
   - Fetch only implementation-relevant MCP setup and workflow guidance.
3. Run `sequentialthinking` to produce an explicit plan:
   - Current-state findings.
   - Candidate solutions.
   - Chosen solution and risk rationale.
4. Execute Serena initialization chain:
   - `initial_instructions` first.
   - onboarding and/or memory checks second.
5. Apply focused, minimal diffs.
6. Validate and report:
   - Run `get_errors` on modified files.
   - Include concrete file references and residual risks.

## Safety and Quality

- Do not embed secrets or API keys.
- Keep UTF-8 (no BOM).
- Prefer deterministic and backward-compatible changes.
- If required tools are unavailable, document attempted calls and continue with conservative fallbacks.

## Validation Checklist

- Serena init chain attempted before major structural edits.
- Prompt, agent, instruction, and skill files pass `get_errors`.
- MCP server naming aligns with `.vscode/mcp.json`.
- VS Code Chat Diagnostics can load the customized assets.

## References

- https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- https://code.visualstudio.com/docs/copilot/customization/prompt-files
- https://code.visualstudio.com/docs/copilot/customization/custom-agents
- https://code.visualstudio.com/docs/copilot/customization/agent-skills
