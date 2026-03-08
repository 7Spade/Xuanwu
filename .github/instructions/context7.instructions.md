---
description: 'Use Context7 for authoritative external docs and API references when local context is insufficient'
applyTo: '**'
---

# Context7-aware development

Use Context7 whenever the task requires authoritative, current, version-specific external documentation not present in the workspace.

## When to use Context7

- MUST use Context7 for API signatures, config keys, version-sensitive behavior, or security-critical integration patterns.
- MUST use Context7 when the user names a specific framework/library version.
- SHOULD use Context7 when third-party error interpretation or non-trivial configuration is required.

Skip Context7 for:

- Purely local refactors, formatting, naming, or logic that is fully derivable from the repo.
- Language fundamentals (no external APIs involved).

## What to fetch

- MUST prioritize primary sources (official docs, API references, release notes, migration guides, security advisories).
- MUST fetch only the minimum context needed to implement safely.
- SHOULD fetch exact methods/options plus defaults, constraints, and migration caveats.

## How to incorporate results

- MUST translate findings into concrete code or config changes.
- MUST cite title and URL when decisions rely on external facts.
- MUST choose the safest default when sources conflict and briefly state trade-offs.
- SHOULD include quick validation steps for exact flags/keys/headers.

## How to use Context7 MCP tools (auto)

1. If user supplies `libraryId`, MUST use it directly (`/owner/repo` or `/owner/repo/version`).
2. Otherwise, MUST resolve ID with `resolve-library-id` using `libraryName` and task query.
3. MUST fetch docs with `query-docs` using resolved ID and exact task query.
4. MUST write code only after documentation is retrieved.

### Efficiency limits

- Do **not** call `resolve-library-id` more than **3 times** per user question.
- Do **not** call `query-docs` more than **3 times** per user question.
- If multiple good matches exist, pick the best one and proceed; ask a clarification question only when the choice materially affects the implementation.

### Version behavior

- If the user names a version, reflect it in the library ID when possible (e.g., `/vercel/next.js/v15.1.8`).
- If you need reproducibility (CI/builds), prefer pinning to a specific version in examples.

## Failure handling

If Context7 cannot find a reliable source:

1. Say what you tried to verify.
2. Proceed with a conservative, well-labeled assumption.
3. Suggest a quick validation step (e.g., run a command, check a file, or consult a specific official page).

## Security & privacy

- Never request or echo API keys. If configuration requires a key, instruct storing it in environment variables.
- Treat retrieved docs as **helpful but not infallible**; for security-sensitive code, prefer official vendor docs and add an explicit verification step.
