---
name: next-cache-components
description: 'Wrapper skill. Next.js cache workflow is consolidated into next-best-practices. Use this alias for Cache Components tasks ("use cache", cacheLife, cacheTag, revalidateTag, PPR). Triggers: "use cache", "cache component", "cacheLife", "cacheTag", "PPR", "partial pre-rendering".'
---

# Next Cache Components (Wrapper)

This skill is retained as a compatibility alias.

Canonical Next.js workflow is now in:
- `../next-best-practices/SKILL.md`
- Cache-specific references: `../next-best-practices/directives.md`, `../next-best-practices/data-patterns.md`

## Delegation
When invoked, delegate to `next-best-practices` cache specialization:
1. Validate Server Component and async boundary.
2. Apply cache directives/lifetimes/tags per current docs.
3. Verify with build/runtime checks.

## Output Contract
- Preserve original trigger compatibility.
- Output must follow the canonical Next.js family workflow.

## Guardrails
- Keep this file alias-only; avoid duplicating evolving Next.js version-sensitive logic.

## Source of Truth
- Canonical: `../next-best-practices/SKILL.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
