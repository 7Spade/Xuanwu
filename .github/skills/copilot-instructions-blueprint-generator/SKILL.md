---
name: copilot-instructions-blueprint-generator
description: 'Wrapper skill. Copilot customization authoring is consolidated into prompt-builder. Use this alias when generating or refining copilot-instructions.md. Triggers: "copilot instructions", "generate instructions", "setup copilot", "ai customization", "copilot-instructions.md".'
---

# Copilot Instructions Blueprint Generator (Wrapper)

This skill is retained as a backward-compatible alias.

Canonical customization authoring workflow is now in:
- `../prompt-builder/SKILL.md`

## Delegation
When invoked, delegate to `prompt-builder` in `copilot-instructions` specialization:
1. Extract project conventions from real files.
2. Draft or refine `.github/copilot-instructions.md`.
3. Validate for determinism, scope, and safety.

## Output Contract
- Preserve original trigger compatibility.
- Output must follow `prompt-builder` quality gates and repository authoring rules.
- Keep evidence-based conventions only.

## Guardrails
- Do not duplicate long authoring workflow logic here.
- Do not diverge from `prompt-builder` conventions.

## Source of Truth
- Canonical: `../prompt-builder/SKILL.md`
- VS Code custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
