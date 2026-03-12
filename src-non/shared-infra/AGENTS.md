# AGENTS.md (src/shared-infra)

Instructions for infrastructure adapters and external integrations in `src/shared-infra/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Infrastructure Adapter Specialist`.

## Boundary
- Keep external system integration, transport, and adapter concerns in this folder.
- Do not place domain decision logic in infrastructure adapters.
- Expose stable adapter interfaces to upper layers.

## Security and Reliability
- Validate untrusted input at boundaries.
- Avoid leaking secrets and sensitive values in logs/errors.
- Handle failures with explicit error mapping.

## Noise Reduction
- Focus on the target adapter path and its interface contracts.
