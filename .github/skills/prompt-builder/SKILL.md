---
name: prompt-builder
description: 'Guide the creation and finalization of high-quality GitHub Copilot prompt and agent files. Use when writing a new prompt file, reusable slash command, chat instruction, or polishing an existing draft before commit. Triggers: "build prompt", "create prompt", "write copilot prompt", "prompt template", "new slash command", "prompt file", "finalize prompt", "polish agent", "improve prompt file", "clean up agent definition", "refine instructions".'
---

# Prompt Builder & Finalizer

## When to Use

**Build mode** — create a new prompt or agent file:
- Writing a new `.prompt.md` file for a Copilot slash command or reusable instruction
- Structuring an existing informal prompt into a proper prompt file
- Creating agent instructions that need clear role boundaries and output formats

**Finalize mode** — polish an existing draft before commit:
- A draft `.prompt.md` or `.agent.md` file needs polishing before merging
- A prompt produces inconsistent or ambiguous output and needs structural improvement
- Refactoring an agent file to align with the latest authoring rules

## Prerequisites
- Identify the prompt's purpose, target audience, and expected output
- Review `.github/instructions/xuanwu-customization-authoring.instructions.md` for agents
- Check existing prompts in `.github/prompts/` for reference patterns
- In finalize mode: read the full draft file before making any changes

## Build Workflow
1. Define the prompt's role in one sentence: "You are a [role] that [does X]."
2. Write the system context: constraints, what the model should and should not do.
3. Specify required tools: list MCP tools or file access needed.
4. Write the task instructions as numbered, imperative steps.
5. Define the output format: structure, length, required sections.
6. Add 1–2 usage examples showing input prompt and expected output format.
7. Write the YAML frontmatter: `mode`, `tools`, `description`.
8. Save under `.github/prompts/` with a descriptive kebab-case filename.

## Finalize Workflow
1. Validate frontmatter: `name`, `description`, required fields are present and correct.
2. Check role clarity: does the file state a clear, testable role or purpose in the first paragraph?
3. Review instruction quality: are rules imperative and specific (MUST/SHOULD/MAY)?
4. Confirm output format is explicitly specified (format, length, structure).
5. Add or improve examples for non-obvious instructions.
6. Remove vague phrasing ("try to", "maybe", "if possible") — replace with deterministic rules.
7. Verify the description is discoverable: states what, when, and trigger keywords.
8. Check for secrets or hardcoded credentials — remove any found.

## Output Contract
- **Build mode**: Produce a complete `.prompt.md` file with valid frontmatter and structured body. Include at least one usage example.
- **Finalize mode**: Return the finalized file content with a summary of every change and its rationale. Changes must be traceable: one rationale per modified section.
- Every instruction must be imperative (MUST/SHOULD/MAY), not aspirational.

## Guardrails
- Do not write prompts that instruct the model to ignore security or safety rules.
- Do not embed secrets, user credentials, or API keys.
- Do not change the core intent or domain of the prompt when finalizing.
- Do not add capabilities beyond what the original file intended.
- Test the prompt against at least one representative input before finalizing.

## Source of Truth
- VS Code prompt files: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Agent authoring rules: `.github/instructions/xuanwu-customization-authoring.instructions.md`
