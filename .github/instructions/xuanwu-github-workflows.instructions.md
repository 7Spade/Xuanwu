---
name: "Xuanwu GitHub Workflow Rules"
description: "Project-specific rules for secure, maintainable, and efficient GitHub Actions workflows."
applyTo: ".github/workflows/*.{yml,yaml}"
---

# Xuanwu GitHub Workflow Rules

## Workflow Design

- MUST use descriptive workflow names, explicit triggers, and clear job boundaries.
- SHOULD reuse workflow logic and deterministic caching where appropriate.
- MUST keep shell steps non-interactive and purpose-specific.

## Security

- MUST set explicit least-privilege `permissions`.
- MUST keep secrets in GitHub or environment secrets and prefer OIDC over long-lived credentials.
- MUST pin third-party actions to trusted versions or SHAs.

## Reliability and Validation

- MUST fail fast for critical quality gates.
- MUST include at least one verification path for workflow changes.
- SHOULD publish required artifacts and set retry/timeout controls for unstable external steps.
