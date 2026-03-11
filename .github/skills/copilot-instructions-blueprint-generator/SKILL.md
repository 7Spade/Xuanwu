---
name: copilot-instructions-blueprint-generator
description: 'Create a comprehensive copilot-instructions.md file tailored to a project by analyzing existing codebase patterns, architecture, and technology stack. Use when setting up Copilot for a new project or improving AI guidance consistency in an existing repo. Triggers: "copilot instructions", "generate instructions", "setup copilot", "ai customization", "copilot-instructions.md".'
---

# Copilot Instructions Blueprint Generator

## When to Use
- Setting up GitHub Copilot for a new project from scratch
- Improving the existing `copilot-instructions.md` to reduce inconsistent AI outputs
- Onboarding Copilot to a new architectural pattern or technology stack

## Prerequisites
- Access to the full project source code
- Identify key technology versions (framework, language, test tools, linting config)
- Review existing architecture docs if present

## Workflow
1. Scan the codebase to identify: primary language, framework, test framework, linting/formatting tools.
2. Extract naming conventions from existing files (functions, variables, files, directories).
3. Identify architecture patterns: layering, module structure, data flow conventions.
4. Collect technology version pins from `package.json`, `pyproject.toml`, or equivalent.
5. Document "do not do" anti-patterns observed in the codebase.
6. Generate the `copilot-instructions.md` with sections: Tech Stack, Naming Conventions, Architecture, Anti-Patterns, Key Commands.
7. Validate the generated file against at least three existing representative files.

## Output Contract
- Produce a `.github/copilot-instructions.md` file.
- Sections must be based on observed patterns, not assumptions.
- Each convention must cite at least one real file as evidence.

## Guardrails
- Do not invent conventions not present in the codebase.
- Do not include secrets, tokens, or credentials.
- If conflicting patterns exist, document both and flag for human resolution.

## Source of Truth
- VS Code custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
