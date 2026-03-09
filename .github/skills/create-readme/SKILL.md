---
name: create-readme
description: 'Create or update a README.md file for the project. Use when starting a new project, documenting an existing one, or regenerating the project overview. Triggers: "create readme", "write readme", "generate README", "add project docs", "update README".'
---

# Create Readme

## When to Use
- Starting a new project and need a README from scratch
- Updating an outdated README to reflect current state
- Generating documentation from existing project structure and code

## Prerequisites
- Review existing `README.md` if present
- Check `package.json` for project name, description, and scripts
- Scan `docs/` directory for additional context

## Workflow
1. Analyze project structure: entry points, tech stack, scripts, and dependencies.
2. Review any existing docs or inline comments for domain context.
3. Draft the README with standard sections: Overview, Prerequisites, Installation, Usage, Configuration, Contributing, License.
4. Include runnable code examples for installation and common commands.
5. Add badges (build status, version, license) where applicable.
6. Verify all listed commands and paths exist and are accurate.

## Output Contract
- Produce a single `README.md` at the project root.
- All code blocks must be runnable and reference real files/commands.
- Sections must be ordered by user onboarding priority.

## Guardrails
- Do not invent commands or file paths that do not exist.
- Keep README focused on end-user onboarding, not internal architecture.
- Do not embed credentials or secrets.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
