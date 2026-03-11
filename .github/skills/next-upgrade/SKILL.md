---
name: next-upgrade
description: 'Wrapper skill. Next.js upgrade workflow is consolidated into next-best-practices. Use this alias for codemod-driven upgrade and migration follow-up. Triggers: "upgrade next.js", "migrate next", "update nextjs", "next.js version", "nextjs breaking changes".'
argument-hint: "[target-version]"
---

# Next Upgrade (Wrapper)

This skill is retained as a compatibility alias.

Canonical Next.js workflow is now in:
- `../next-best-practices/SKILL.md`

## Delegation
When invoked, delegate to `next-best-practices` upgrade specialization:
1. Run official codemod path for target version.
2. Resolve migration guide deltas.
3. Validate build/runtime and summarize residual warnings.

## Output Contract
- Preserve original trigger compatibility and argument-hint.
- Output follows canonical Next.js family verification/report shape.

## Guardrails
- Keep this file alias-only to avoid duplicated version-sensitive guidance.

## Source of Truth
- Canonical: `../next-best-practices/SKILL.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
