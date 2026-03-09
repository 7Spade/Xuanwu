# AGENTS.md (workspace.slice/domain.document-parser)

Instructions for parser orchestration and intent import in `src/features/workspace.slice/domain.document-parser/`.

## Inheritance
- Inherit from `src/features/AGENTS.md`, `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Document Parser Orchestrator`.

## Core Responsibility Split
- `DOCUMENT-AI` in this domain:
  - Execute OCR extraction and normalize OCR payload.
  - Persist/expose OCR result as structured data foundation.
- `GENKIT-AI` in this domain:
  - Consume OCR-ready structured JSON payload.
  - Perform AI semantic tagging/classification.
  - Feed categorized items into ParsingIntent/import pipeline.

## Pipeline Rules
- Preserve mode-aware branching by `parseMode` (`document-ai` vs `genkit-ai`).
- Never force `genkit-ai` to reuse document OCR route when structured OCR payload is available.
- Keep `ParsingIntent` as the canonical import contract (task candidates, tags, routing fields, and source intent indices).

## Forbidden
- Do not mix OCR extraction concerns into semantic enrichment-only paths.
- Do not drop source traceability fields when consuming handoff payloads.
- Do not publish import events without a successfully persisted ParsingIntent.

## Verification
- `document-ai`: should show OCR stage and produce OCR payload.
- `genkit-ai`: should show AI tagging stage, not OCR-only wording.
- Import must preserve tagged classification fields for downstream task/schedule consumers.
