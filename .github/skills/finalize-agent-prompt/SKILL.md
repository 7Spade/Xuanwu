---
name: finalize-agent-prompt
description: 'Polish and finalize a Copilot prompt or agent definition file for end-user consumption. Use when a draft prompt needs clarity, stronger role-framing, structured instructions, or output format improvements before committing. Triggers: "finalize prompt", "polish agent", "improve prompt file", "clean up agent definition", "refine instructions".'
---

# Finalize Agent Prompt

## When to Use
- A draft `.prompt.md` or `.agent.md` file needs polishing before merging
- A prompt produces inconsistent or ambiguous output and needs structural improvement
- Refactoring an agent file to align with the latest authoring rules

## Prerequisites
- Read `.github/instructions/agent-authoring-rules.instructions.md` for agents
- Read `docs/copilot/customization/prompt-files.md` for prompts
- Read the draft file in full before making any changes

## Workflow
1. Validate frontmatter: `name`, `description`, required fields are present and correct.
2. Check role clarity: does the file state a clear, testable role or purpose in the first paragraph?
3. Review instruction quality: are rules imperative and specific (MUST/SHOULD/MAY)?
4. Confirm output format is explicitly specified (format, length, structure).
5. Add or improve examples for non-obvious instructions.
6. Remove vague phrasing ("try to", "maybe", "if possible") — replace with deterministic rules.
7. Verify the description is discoverable: states what, when, and trigger keywords.
8. Check for secrets or hardcoded credentials — remove any found.

## Output Contract
- Return the finalized file content with a summary of every change and its rationale.
- Changes must be traceable: one rationale per modified section.

## Guardrails
- Do not change the core intent or domain of the prompt.
- Do not add capabilities beyond what the original file intended.
- Do not embed secrets, tokens, or personal credentials.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Agent authoring rules: `.github/instructions/agent-authoring-rules.instructions.md`
