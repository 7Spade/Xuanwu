---
name: "Context7 Usage Rules"
description: "Rules for when and how to use Context7 for authoritative external documentation."
applyTo: "**/*"
---

# Context7 Usage Rules

## Use Criteria

- MUST use Context7 for version-sensitive APIs, config keys, and security-critical integrations.
- MUST use Context7 when the user specifies a framework or library version.
- SHOULD skip Context7 for purely local refactors and language fundamentals.

## Source Quality

- MUST prioritize official vendor docs, API references, release notes, and migration guides.
- MUST retrieve only the minimum context required for safe implementation.
- SHOULD include defaults, constraints, and migration caveats when relevant.

## Execution Flow

1. MUST use provided `libraryId` directly when available.
2. MUST resolve library ID before querying docs when `libraryId` is absent.
3. MUST fetch docs before writing implementation.
4. MUST cite title and URL when decisions depend on external facts.

## Limits

- MUST NOT call `resolve-library-id` more than 3 times per user request.
- MUST NOT call `query-docs` more than 3 times per user request.
- SHOULD choose the best match and proceed unless ambiguity changes implementation outcome.

## Failure Handling

- MUST state what was attempted when reliable docs are unavailable.
- MUST continue with a conservative, clearly labeled assumption.
- SHOULD include a concrete validation step for the assumption.

## Security

- MUST NOT request, print, or store API keys in chat or code.
- MUST instruct secret usage through environment variables or secret managers.
