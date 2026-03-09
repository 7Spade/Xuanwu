---
name: prompt-builder
description: 'Guide the creation of high-quality GitHub Copilot prompt files with proper frontmatter, structure, tool references, and best practices. Use when writing a new prompt file, reusable slash command, or chat instruction. Triggers: "build prompt", "create prompt", "write copilot prompt", "prompt template", "new slash command", "prompt file".'
---

# Prompt Builder

## When to Use
- Writing a new `.prompt.md` file for a Copilot slash command or reusable instruction
- Structuring an existing informal prompt into a proper prompt file
- Creating agent instructions that need clear role boundaries and output formats

## Prerequisites
- Identify the prompt's purpose, target audience, and expected output
- Review `.github/instructions/agent-authoring-rules.instructions.md` for agents
- Check existing prompts in `.github/prompts/` for reference patterns

## Workflow
1. Define the prompt's role in one sentence: "You are a [role] that [does X]."
2. Write the system context: constraints, what the model should and should not do.
3. Specify required tools: list MCP tools or file access needed.
4. Write the task instructions as numbered, imperative steps.
5. Define the output format: structure, length, required sections.
6. Add 1–2 usage examples showing input prompt and expected output format.
7. Write the YAML frontmatter: `mode`, `tools`, `description`.
8. Save under `.github/prompts/` with a descriptive kebab-case filename.

## Output Contract
- Produce a complete `.prompt.md` file with valid frontmatter and structured body.
- Include at least one usage example in the body.
- Every instruction must be imperative (MUST/SHOULD/MAY), not aspirational.

## Guardrails
- Do not write prompts that instruct the model to ignore security or safety rules.
- Do not embed secrets, user credentials, or API keys.
- Test the prompt against at least one representative input before finalizing.

## Source of Truth
- VS Code prompt files: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
