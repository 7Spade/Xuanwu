---
name: next-upgrade
description: 'Upgrade Next.js to a newer version using official codemods, migration guides, and manual follow-up steps. Use when upgrading between Next.js major or minor versions, resolving breaking changes, or addressing deprecation warnings after an npm update. Triggers: "upgrade next.js", "migrate next", "update nextjs", "next.js version", "nextjs breaking changes".'
argument-hint: "[target-version]"
---

# Next Upgrade

## When to Use
- Upgrading from one Next.js major version to another (e.g., 14 → 15 → 16)
- Resolving type errors or deprecation warnings after `npm update`
- Migrating async params, cookies, headers, or image defaults

## Prerequisites
- Clean git working directory (commit or stash all changes first)
- Node.js 18+ installed
- Note current version: `npm ls next`

## Workflow
1. Run the official upgrade codemod: `npx @next/codemod upgrade [target-version]`.
2. Review codemod output and commit all automatic changes.
3. Check the migration guide for the target version at https://nextjs.org/docs/app/guides/upgrading.
4. Fix remaining breaking changes not covered by the codemod:
   - Async APIs: `params`, `searchParams`, `cookies()`, `headers()`
   - Config renames in `next.config.js/ts`
   - Image defaults and optimization changes
5. Run `npm run build` and fix any TypeScript or lint errors.
6. Run `npm run dev` and smoke-test at least the landing page and one authenticated route.
7. Update `package.json` engine constraints if the minimum Node.js version changed.

## Failure Handling
- If the codemod fails, ensure git state is clean before retrying.
- If build fails with module resolution errors, check for removed packages or changed import paths.
- If runtime errors appear, check async boundary changes (params/cookies must now be awaited).

## Output Contract
- Document: starting version, target version, codemod result, manual changes applied, verification result.
- List any remaining deprecation warnings with links to resolution docs.

## Guardrails
- Never run the codemod on a dirty git tree.
- Do not skip the build verification step.
- Do not upgrade React independently; let the codemod manage React peer-dependency alignment.

## Source of Truth
- Next.js upgrade guide: https://nextjs.org/docs/app/guides/upgrading
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
