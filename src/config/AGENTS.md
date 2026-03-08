# AGENTS.md (src/config)

Instructions for configuration modules in `src/config/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Configuration Steward`.

## Boundary
- Keep this folder declarative: constants, environment mapping, config utilities.
- Do not add feature-specific business workflows here.
- No direct UI behavior logic in config modules.

## Noise Reduction
- Limit edits to config files and direct consumers.
- Avoid unrelated refactors while changing configuration.

## Security
- Never hardcode secrets.
- Read secrets from environment/config providers only.
