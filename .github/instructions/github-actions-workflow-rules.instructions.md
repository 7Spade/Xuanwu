---
name: "GitHub Actions Workflow Rules"
description: "Rule-based standards for GitHub Actions workflow design, security, and CI/CD efficiency."
applyTo: ".github/workflows/*.{yml,yaml}"
---

# GitHub Actions Workflow Rules

## Workflow Design

- MUST use descriptive workflow names and explicit triggers.
- MUST separate workflows into focused jobs with clear `needs` dependencies.
- SHOULD use `workflow_call` to avoid repeated pipeline logic.
- SHOULD use `concurrency` for deploy or stateful workflows.

## Security

- MUST set explicit `permissions` and default to least privilege.
- MUST keep secrets in GitHub Secrets or Environment Secrets.
- MUST prefer OIDC over long-lived cloud credentials.
- MUST pin third-party actions to a trusted version or commit SHA.
- MUST include dependency and security scanning in CI.

## Reliability

- MUST fail fast for critical quality gates.
- MUST publish build/test artifacts required by downstream jobs.
- SHOULD configure retry or timeout controls for unstable external steps.
- SHOULD gate production deployment with environment protection rules.

## Performance

- SHOULD cache dependencies and toolchains with deterministic keys.
- SHOULD use matrix builds for multi-version or multi-platform validation.
- SHOULD use shallow checkout unless full history is required.

## Maintainability

- MUST keep each step purpose-specific and clearly named.
- MUST keep shell scripts deterministic and non-interactive.
- SHOULD centralize shared commands in scripts or reusable actions.

## Validation

- MUST ensure workflow changes include at least one verification path.
- SHOULD document non-obvious workflow constraints near the workflow file.
