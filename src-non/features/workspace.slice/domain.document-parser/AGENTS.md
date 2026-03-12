# AGENTS.md (workspace.slice/domain.document-parser)

Instructions for parser orchestration and intent import in `src/features/workspace.slice/domain.document-parser/`.

## Inheritance
- Inherit from `src/features/AGENTS.md`, `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Document Parser Orchestrator`.

## Core Responsibility Split
- `DOCUMENT-AI` in this domain:
  - Execute OCR extraction from original document input.
  - Produce normalized structured JSON payload (`*.document-ai.json`).
  - This stage is responsible for generating `.json`.
- `GENKIT-AI` in this domain:
  - Consume existing `*.document-ai.json` payload.
  - Perform AI semantic tagging/classification on JSON content.
  - Feed categorized/tagged items into ParsingIntent/import pipeline.
  - This stage must not regenerate OCR JSON.

## Pipeline Rules
- Preserve mode-aware branching by `parseMode` (`document-ai` vs `genkit-ai`).
- Never force `genkit-ai` to run OCR when `*.document-ai.json` is available.
- Keep `ParsingIntent` as the canonical import contract (task candidates, tags, routing fields, and source intent indices).

## Forbidden
- Do not mix OCR extraction concerns into semantic enrichment-only paths.
- Do not drop source traceability fields when consuming handoff payloads.
- Do not publish import events without a successfully persisted ParsingIntent.

## Verification
- `document-ai`: should produce/update `*.document-ai.json`.
- `genkit-ai`: should read `*.document-ai.json` and run AI tagging stage.
- Import must preserve tagged classification fields for downstream task/schedule consumers.
