# AGENTS.md (src/shared-kernel)

Instructions for shared kernel modules in `src/shared-kernel/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Shared Kernel Guardian`.

## Boundary
- Keep modules deterministic and side-effect free.
- No direct I/O, network, database, framework runtime, or UI dependencies.
- Provide stable, minimal abstractions reused across slices.

## DDD Language
- Shared terms/types must align with SSOT and avoid slice-specific leakage.

## Noise Reduction
- Constrain changes to generic primitives and contracts with clear reusability value.

## Quality Gate
- Any change here must consider impact on all dependent slices.
